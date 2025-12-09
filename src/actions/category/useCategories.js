'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';
import { useCategoryStore } from 'src/store/categoryStore';

import { GET_CATEGORIES_QUERY } from './queries';

// React Query options reasonable for categories (cache long)
const QUERY_KEY = ['graphql', 'categories'];

async function fetchCategories() {
  const res = await graphqlClient.request(GET_CATEGORIES_QUERY);
  return res?.categories ?? null;
}

/**
 * Hook useCategories
 * - usa react-query para traer categories
 * - actualiza el zustand store para lecturas sin rehacer la query
 */
export function useCategories() {
  const setCategories = useCategoryStore((s) => s.setCategories);
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false,
  });

  // derive useful shapes once
  const memo = useMemo(() => {
    const root = data?.items?.[0] || null;
    const children = Array.isArray(root?.children) ? root.children : [];

    const categoriesOptions = children.map((c) => ({
      id: c.id,
      value: c.uid,
      label: c.name,
    }));

    // update zustand store with raw children (or whatever you want)
    setCategories(children);

    return {
      categoriesOptions,
      categoriesRaw: data,
      categoriesLoading: isLoading,
      categoriesError: isError ? error : null,
      categoriesValidating: isFetching,
    };
  }, [data, isLoading, isError, error, isFetching, setCategories]);

  return memo;
}
