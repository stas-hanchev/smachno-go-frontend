'use client';

import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { searchAddresses, type AddressSuggestion } from '@/api/geocoding';
import { ua } from '@/i18n/ua';
import type { LatLng } from '@/lib/geo';

const MIN_QUERY_LENGTH = 3;

export function AddressAutocomplete({
  near,
  onSelect,
}: {
  near: LatLng | null;
  onSelect: (place: { point: LatLng; address: string }) => void;
}) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = input.trim();
    if (query.length < MIN_QUERY_LENGTH) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      searchAddresses(query, near, controller.signal)
        .then(setOptions)
        .catch(() => {
          if (!controller.signal.aborted) setOptions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [input, near]);

  return (
    <Autocomplete<AddressSuggestion>
      options={input.trim().length < MIN_QUERY_LENGTH ? [] : options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onInputChange={(_e, value) => setInput(value)}
      onChange={(_e, value) => {
        if (value) onSelect({ point: value.point, address: value.label });
      }}
      noOptionsText={ua.location.addressPlaceholder}
      loadingText={ua.common.loading}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={ua.location.addressPlaceholder}
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, 'aria-label': ua.location.address },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <PlaceOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
