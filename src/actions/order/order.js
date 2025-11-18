'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_CITIES_QUERY } from '../common/queries';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetCities() {
  const { data, isLoading, error, isValidating } = useSWR(
    ['graphql:cities'],
    async () => {
      const res = await graphqlClient.request(GET_CITIES_QUERY);
      return res?.allCities ?? null;
    },
    { ...swrOptions }
  );

  const memo = useMemo(() => {
    const items = Array.isArray(data?.items) ? data.items : [];

    const sorted = [...items].sort((a, b) =>
      String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'es', { sensitivity: 'base' })
    );

    const citiesOptions = sorted.map((c) => ({
      id: c.id,
      value: c.code,
      label: c.name,
      regionId: Number(c?.region?.id ?? 0),
      regionName: c?.region?.name ?? '',
    }));

    return {
      citiesOptions,
      citiesLoading: isLoading,
      citiesError: error ?? null,
      citiesValidating: isValidating,
    };
  }, [data, isLoading, error, isValidating]);

  return memo;
}
