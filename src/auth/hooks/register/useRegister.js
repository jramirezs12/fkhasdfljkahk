'use client';

import { useMutation } from '@tanstack/react-query';

import { useRouter } from 'src/routes/hooks';

import { createCustomer } from './createCustomer';

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: createCustomer,
        onSuccess: async () => {
            router.replace('/auth/login');
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useRegister;