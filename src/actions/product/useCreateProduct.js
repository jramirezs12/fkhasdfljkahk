'use client';

import { useMutation } from '@tanstack/react-query';
//import { useRouter } from 'src/routes/hooks';

import { createProduct } from './createProduct';

export function useCreateProduct() {
    //const router = useRouter();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: async () => {
            //router.replace('/home/product');
            //router.refresh();
            console.log('Producto creado corerrectamente.');
        },
        onError: (error) => {
            console.error(error);
        }
    });
};

export default useCreateProduct;