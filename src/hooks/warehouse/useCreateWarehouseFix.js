'use client';

import { useMutation } from '@tanstack/react-query';

import { useRouter } from 'src/routes/hooks';

import { createWarehouse } from './createWarehouse';

export function useCreateWarehouseFix() {
    const router = useRouter();

    return useMutation({
        mutationFn: createWarehouse,
        onSuccess: async () => {
            router.replace('/home/warehouse');
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useCreateWarehouseFix;