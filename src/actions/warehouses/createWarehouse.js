'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_WAREHOUSE_MUTATION } from './mutations';

export const createWarehouse = async ({ address, name, city, contact_email, contact_name, contact_phone }) => {
    try {
        const result = await graphqlClient.request(CREATE_WAREHOUSE_MUTATION, { address, name, city, contact_email, contact_name, contact_phone });
        const data = result.createWarehouse;

        if (!data || !data.name) {
            console.error(data);
            throw new Error('Error al crear Sucursal');
        }
        return true;
    } catch (error) {
        console.error(error);
        throw error.response.errors[0].message;
    }
};
