'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_WAREHOUSE_MUTATION } from './queries';

/**
 * createWarehouse - low level function that calls GraphQL.
 * Returns created warehouse object on success, throws Error on failure.
 */
export async function createWarehouse({ address, name, city, contact_email, contact_name, contact_phone } = {}) {
  // Basic validation before network call
  const required = { address, name, city, contact_email, contact_name, contact_phone };
  const missing = Object.entries(required).filter(([, v]) => v === undefined || v === null || String(v).trim() === '');
  if (missing.length) {
    throw new Error(`Faltan campos obligatorios: ${missing.map((m) => m[0]).join(', ')}`);
  }

  try {
    const res = await graphqlClient.request(CREATE_WAREHOUSE_MUTATION, {
      address,
      name,
      city,
      contact_email,
      contact_name,
      contact_phone,
    });

    const created = res?.createWarehouse;
    if (!created) {
      throw new Error('Respuesta inválida del servidor al crear la bodega');
    }

    return created;
  } catch (err) {
    // normalize GraphQL errors
    if (err?.response?.errors && Array.isArray(err.response.errors) && err.response.errors.length) {
      const msg = err.response.errors[0]?.message || 'Error al crear Sucursal';
      throw new Error(msg);
    }
    // fallback
    throw new Error(err?.message || 'Error al crear Sucursal');
  }
}

export default createWarehouse;
