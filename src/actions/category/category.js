'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_CATEGORIES_QUERY } from './queries';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetCategories() {
  const { data, isLoading, error, isValidating } = useSWR(
    ['graphql:categories'],
    async () => {
      const res = await graphqlClient.request(GET_CATEGORIES_QUERY);
      return res?.categories ?? null;
    },
    { ...swrOptions }
  );

  const memo = useMemo(() => {
    const root = data?.items?.[0] || null; // Default Category
    const children = Array.isArray(root?.children) ? root.children : [];

    // Opciones para el filtro (hijos directos del root)
    const categoriesOptions = children.map((c) => ({
      id: c.id,
      value: c.uid,
      label: c.name,
    }));

    // Mapa de uids de hijos directos (si necesitas incluir descendientes, amplía el query con más niveles)
    const directChildrenMap = new Map();
    for (const c of children) {
      directChildrenMap.set(c.uid, []); // sin nietos en este query
    }

    return {
      categoriesOptions,
      directChildrenMap, // actualmente vacío para cada hijo (no se pidieron nietos)
      categoriesLoading: isLoading,
      categoriesError: error ?? null,
      categoriesValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  return memo;
}
