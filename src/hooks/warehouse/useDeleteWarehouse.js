'use client';

import { useMutation } from '@tanstack/react-query';

import { useRouter } from 'src/routes/hooks';

import { deleteWarehouse } from './deleteWarehouse';

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: async () => {
            router.replace('/auth/login');
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useRegister;