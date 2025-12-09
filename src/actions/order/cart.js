'use client';

import { GraphQLClient } from 'graphql-request';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { getSessionToken } from 'src/auth/context/login/utils';

import {
  PLACE_ORDER,
  CREATE_GUEST_CART,
  CUSTOMER_CART_QUERY,
  ASSIGN_WAREHOUSE_ORDER,
  ADD_DATA_TO_CART_GUEST,
  ADD_DATA_TO_CART_CUSTOMER
} from './mutations';

/**
 * Helper: proxy endpoint (same as earlier)
 */
function proxyEndpoint() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }
  return process.env.INTERNAL_GRAPHQL_PROXY_URL || 'http://localhost:3000/api/graphql-proxy';
}

/**
 * useCreateGuestCart:
 * - If user is authenticated, returns customerCart id.
 * - If not, creates guest cart as before.
 */
export function useCreateGuestCart(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['cart', 'createGuest'],
    mutationFn: async () => {
      try {
        const jwt = await getSessionToken();
        if (jwt) {
          // logged in -> use customerCart
          const client = new GraphQLClient(proxyEndpoint(), {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          });
          const data = await client.request(CUSTOMER_CART_QUERY);
          const id = data?.customerCart?.id;
          if (!id) throw new Error('No se encontró carrito para el usuario autenticado.');
          return id;
        }
        // guest
        const client = graphqlClient;
        const data = await client.request(CREATE_GUEST_CART, {});
        const id = data?.createGuestCart?.cart?.id;
        if (!id) throw new Error('No se pudo crear el carrito de invitado');
        return id;
      } catch (err) {
        const message = err?.message || 'Error creando carrito';
        throw new Error(message);
      }
    },
    onSuccess(data) {
      qc.invalidateQueries(['cart']);
      if (options.onSuccess) options.onSuccess(data);
    },
    ...options,
  });
}

/**
 * useAddDataToCart:
 * - Chooses the proper mutation document depending on whether the user is logged in.
 * - For logged in customers it uses ADD_DATA_TO_CART_CUSTOMER (omits setGuestEmailOnCart).
 */
export function useAddDataToCart(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['cart', 'addData'],
    mutationFn: async (params) => {
      const jwt = await getSessionToken();
      if (jwt) {
        // customer flow
        const client = new GraphQLClient(proxyEndpoint(), {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        });

        // map params: guest version expects email param which we don't send to customer mutation
        const {
          cartId,
          quantity,
          sku,
          dropper_price,
          firstname,
          lastname,
          street,
          city,
          region_id,
          telephone,
          // email, // omit for customer
          carrier_code,
          method_code,
          payment_code,
        } = params;

        await client.request(ADD_DATA_TO_CART_CUSTOMER, {
          cartId,
          quantity,
          sku,
          dropper_price,
          firstname,
          lastname,
          street,
          city,
          region_id: Number(region_id),
          telephone,
          carrier_code,
          method_code,
          payment_code,
        });

        return true;
      } else {
        // guest flow using shared graphqlClient
        const client = graphqlClient;
        await client.request(ADD_DATA_TO_CART_GUEST, params);
        return true;
      }
    },
    onSuccess() {
      qc.invalidateQueries(['cart']);
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
}

export function usePlaceOrder(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['cart', 'placeOrder'],
    mutationFn: async ({ cartId }) => {
      const client = graphqlClient;
      const data = await client.request(PLACE_ORDER, { cartId });
      const errors = data?.placeOrder?.errors ?? [];
      if (errors.length) {
        const first = errors[0]?.message ?? 'Error al colocar la orden';
        throw new Error(first);
      }
      const orderId = data?.placeOrder?.orderV2?.id;
      if (!orderId) throw new Error('No se recibió el id de la orden');
      return orderId;
    },
    onSuccess(orderId) {
      qc.invalidateQueries(['cart']);
      qc.invalidateQueries(['orders']);
      if (options.onSuccess) options.onSuccess(orderId);
    },
    ...options,
  });
}

/**
 * Assign warehouse order: requiere token JWT desencriptado.
 * Usamos un cliente dedicado con Authorization para evitar que global clients lo mangleen.
 */
export function useAssignWarehouseOrder(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['order', 'assignWarehouse'],
    mutationFn: async ({ magento_order_id, tokenLike } = {}) => {
      let jwt = await getSessionToken();
      if (!jwt) jwt = tokenLike;
      if (!jwt) throw new Error('Token requerido para asignar orden al warehouse');

      if (String(jwt).split('.').length !== 3) {
        throw new Error('Token inválido (no es JWT).');
      }

      const client = new GraphQLClient(proxyEndpoint(), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = await client.request(ASSIGN_WAREHOUSE_ORDER, { magento_order_id });
      const res = data?.assignWarehouseOrder;
      if (!res?.success) {
        throw new Error(res?.message || 'No se pudo asignar la orden al warehouse');
      }
      return res;
    },
    onSuccess(res) {
      qc.invalidateQueries(['orders']);
      if (options.onSuccess) options.onSuccess(res);
    },
    ...options,
  });
}
