'use client';

import { GraphQLClient } from 'graphql-request';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';
import { useWarehousesStore } from 'src/store/warehousesStore';

import { GET_WAREHOUSES, GET_WAREHOUSE_BY_ID, CHANGE_WAREHOUSE_STATUS } from './queries';

/**
 * useGetWarehouses - react-query wrapper for warehouses list.
 * Keeps zustand store in sync.
 */
export function useGetWarehouses({ enabled = true } = {}) {
  const setWarehouses = useWarehousesStore((s) => s.setWarehouses);

  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const data = await graphqlClient.request(GET_WAREHOUSES);
      return data?.getWarehouses ?? [];
    },
    onSuccess: (data) => {
      setWarehouses(data);
    },
    staleTime: 1000 * 60 * 2,
    enabled,
  });
}

/**
 * useGetWarehouseById - fetch a single warehouse by id
 */
export function useGetWarehouseById(id, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const data = await graphqlClient.request(GET_WAREHOUSE_BY_ID, { id: Number(id) });
      return data?.getWarehouseById ?? null;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * useChangeWarehouseStatus - mutation to toggle/change status
 * Uses a dedicated GraphQLClient that will go through proxy + auth when needed.
 */
export function useChangeWarehouseStatus(options = {}) {
  const qc = useQueryClient();
  return {
    mutateAsync: async (id) => {
      // Create dedicated client (graphqlClient could be used too)
      const client = new GraphQLClient(typeof window !== 'undefined' ? `${window.location.origin}/api/graphql-proxy` : undefined, {
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await client.request(CHANGE_WAREHOUSE_STATUS, { id: Number(id) });
      const status = res?.changeWarehouseStatus?.status ?? null;
      // invalidate warehouses list and single
      await qc.invalidateQueries({ queryKey: ['warehouses'] });
      await qc.invalidateQueries({ queryKey: ['warehouse', id] });
      return status;
    },
    // keep compatibility with previous API
    ...options,
  };
}
