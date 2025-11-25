'use client';

import { useMutation } from '@tanstack/react-query';

import { useRouter } from 'src/routes/hooks';

import { createWarehouse } from '../../actions/warehouses/createWarehouse';

export function useCreateWarehouse() {
    const router = useRouter();

    return useMutation({
        mutationFn: createWarehouse,
        onSuccess: async () => {
            router.replace('/home/warehouse');
            router.refresh();
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useCreateWarehouse;