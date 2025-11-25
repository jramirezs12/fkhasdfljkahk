'use client';

import { useMutation } from '@tanstack/react-query';

import { createProduct } from './createProduct';

export function useCreateProduct() {
    return useMutation({
        mutationFn: createProduct,
        onSuccess: async () => {
            console.log('Producto creado corerrectamente.');
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useCreateProduct;