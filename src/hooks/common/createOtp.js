'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_OTP_REGISTER_MUTATION } from './mutations';

export const createOtp = async ({ phone }) => {
    try {
        const result = await graphqlClient.request(CREATE_OTP_REGISTER_MUTATION, {type: "register", phone, otpProcess: "dropshipping" });
        const data = result.CreateOtpCode;
        if (!data || !data.success) {
            throw new Error('Error al crear OTP');
        }        
        console.log("OTP:", data);
        return data;
    } catch {
        throw 'Error al crear OTP';
    }
};