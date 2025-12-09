'use client';

import { useMutation } from '@tanstack/react-query';

import { createOtp } from './createOtp';

export function useCreateOtpRegister() {

    return useMutation({
        mutationKey: ['graphql:createotp'],
        mutationFn: createOtp,
        onError: (error) => {
            console.log(error);
        }
    });
};

export default useCreateOtpRegister;