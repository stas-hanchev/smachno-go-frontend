'use client';

import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getCategories, getTags } from '@/api/catalog';
import type { PickupFilter } from '@/api/types';
import { ToggleChips } from '@/components/ui/FilterChips';
import { ua } from '@/i18n/ua';
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  toggleId,
  type CatalogFilters,
} from '@/lib/catalog-filters';

const PICKUP_OPTIONS: { value: PickupFilter; label: string }[] = [
  { value: 'now', label: ua.catalog.pickupNow },
  { value: 'today', label: ua.catalog.pickupToday },
  { value: 'tonight', label: ua.catalog.pickupTonight },
  { value: 'tomorrow', label: ua.catalog.pickupTomorrow },
];

function PriceInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const [text, setText] = useState(value === null ? '' : String(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (syncedValue !== value) {
    setSyncedValue(value);
    setText(value === null ? '' : String(value));
  }

  function commit() {
    const n = text.trim() === '' ? null : Number(text);
    onCommit(n === null || !Number.isFinite(n) || n < 0 ? null : n);
  }

  return (
    <TextField
      size="small"
      label={label}
      type="number"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
      slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
    />
  );
}

export function FiltersPanel({
  filters,
  onChange,
}: {
  filters: CatalogFilters;
  onChange: (patch: Partial<CatalogFilters>) => void;
}) {
  const categories = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => getCategories(),
    staleTime: Infinity,
  });
  const tags = useQuery({ queryKey: ['tags'], queryFn: getTags, staleTime: Infinity });

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {ua.catalog.category}
        </Typography>
        <ToggleChips
          label={ua.catalog.category}
          values={filters.categoryIds}
          options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
          onToggle={(id) => onChange({ categoryIds: toggleId(filters.categoryIds, id) })}
        />
      </div>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {ua.catalog.pickup}
        </Typography>
        <ToggleChips
          label={ua.catalog.pickup}
          values={filters.pickup ? [filters.pickup] : []}
          options={PICKUP_OPTIONS}
          onToggle={(value) => onChange({ pickup: filters.pickup === value ? null : value })}
        />
      </div>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {ua.catalog.price}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <PriceInput
            label={ua.catalog.priceFrom}
            value={filters.priceMin}
            onCommit={(priceMin) => onChange({ priceMin })}
          />
          <PriceInput
            label={ua.catalog.priceTo}
            value={filters.priceMax}
            onCommit={(priceMax) => onChange({ priceMax })}
          />
        </Stack>
      </div>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {ua.catalog.diet}
        </Typography>
        <ToggleChips
          label={ua.catalog.diet}
          values={filters.tagIds}
          options={(tags.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
          onToggle={(id) => onChange({ tagIds: toggleId(filters.tagIds, id) })}
        />
      </div>
      <FormControlLabel
        control={
          <Switch
            checked={filters.availableOnly}
            onChange={(e) => onChange({ availableOnly: e.target.checked })}
          />
        }
        label={ua.catalog.availableOnly}
      />
      {activeFilterCount(filters) > 0 && (
        <Button
          variant="text"
          onClick={() =>
            onChange({
              categoryIds: DEFAULT_FILTERS.categoryIds,
              tagIds: DEFAULT_FILTERS.tagIds,
              priceMin: null,
              priceMax: null,
              pickup: null,
              availableOnly: true,
            })
          }
        >
          {ua.catalog.resetFilters}
        </Button>
      )}
    </Stack>
  );
}
