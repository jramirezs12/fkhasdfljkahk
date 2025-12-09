import { useState, useEffect } from 'react';

import { requestGql } from 'src/lib/graphqlRequest';

import { GET_WAREHOUSES } from './queries';

export function useGetWarehouseFix() {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const data = await requestGql('GetWarehouses', GET_WAREHOUSES);
      setWarehouses(data?.getWarehouses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();

  }, []);

  return { warehouses, isLoading, error, refetch: fetchWarehouses };
}
