'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { SHIPPING_QUOTE_MUTATION } from './queries';

/**
 * fetchShippingQuote
 * Llama al endpoint GraphQL para obtener la cotización de envío.
 *
 * @param {string} destinationCityName - Nombre de la ciudad destino
 * @param {number|string} productId - Id del producto (se convierte a number)
 * @param {number|string} qty - Cantidad (por defecto 1)
 * @returns {Promise<{dateDelivery?: string, deliveryDays?: number, price: number}>}
 */
export async function fetchShippingQuote(destinationCityName, productId, qty = 1) {
  try {
    const variables = {
      destinationCityName,
      productId: Number(productId),
      qty: Number(qty),
    };

    const data = await graphqlClient.request(SHIPPING_QUOTE_MUTATION, variables);

    const quote = data?.shippingQuote ?? null;

    if (!quote) {
      console.error('shippingQuote returned empty', data);
      throw new Error('No se obtuvo cotización de envío');
    }

    return {
      dateDelivery: quote.dateDelivery,
      deliveryDays: quote.deliveryDays,
      price: Number(quote.price ?? 0),
    };
  } catch (error) {
    console.error('Error fetching shipping quote', error);
    const message =
      error?.response?.errors?.[0]?.message ||
      error?.message ||
      'Error al obtener cotización de envío';
    throw new Error(message);
  }
}
