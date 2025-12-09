'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { REGISTER_MUTATION } from './mutations';

export const deleteWarehouse = async ({ email, firstname, lastname, otpCode, password, phoneNumber, roleId }) => {
    try {
        const result = await graphqlClient.request(REGISTER_MUTATION, { email, firstname, lastname, otpCode, otpProcess: "dropshipping", password, phoneNumber, roleId, type: "register" });
        const data = result.CreateCustomerWithOtp;

        if (!data) {
            throw new Error('Error al crear usuario');
        }
        if (!data.success) {
            throw new Error('Error: ' + data.message || 'Error al crear usuario');
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};