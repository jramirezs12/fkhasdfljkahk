'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_CITIES_QUERY } from './queries';

const QUERY_KEY = ['graphql', 'allCities'];

async function fetchCities() {
  const data = await graphqlClient.request(GET_CITIES_QUERY);
  return data?.allCities?.items || [];
}

/**
 * useGetCities - hook estándar para traer las ciudades
 * devuelve lista transformada para select options y estados de react-query
 */
export function useGetCities() {
  const { data = [], isLoading, isError, error, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const memo = useMemo(() => {
    const items = Array.isArray(data) ? data : [];

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
      citiesError: isError ? error : null,
      citiesValidating: isFetching,
      raw: items,
    };
  }, [data, isLoading, isError, error, isFetching]);

  return memo;
}
