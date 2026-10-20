'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllergens, getCategories, getTags } from '@/api/catalog';
import { useCities } from './useSearchArea';

export function useDictionaries() {
  const categories = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => getCategories(),
    staleTime: Infinity,
  });
  const tags = useQuery({ queryKey: ['tags'], queryFn: getTags, staleTime: Infinity });
  const allergens = useQuery({
    queryKey: ['allergens'],
    queryFn: getAllergens,
    staleTime: Infinity,
  });
  const cities = useCities();
  return {
    categories: categories.data ?? [],
    tags: tags.data ?? [],
    allergens: allergens.data ?? [],
    cities: cities.data ?? [],
    ready: categories.isSuccess && tags.isSuccess && allergens.isSuccess && cities.isSuccess,
  };
}
