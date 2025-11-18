import graphqlClient from 'src/lib/graphqlClient';

import { PLACE_ORDER, ADD_DATA_TO_CART, CREATE_GUEST_CART, ASSIGN_WAREHOUSE_ORDER } from './mutations';

export async function createGuestCart() {
  const data = await graphqlClient.request(CREATE_GUEST_CART, {}, { Authorization: '' });
  const id = data?.createGuestCart?.cart?.id;
  if (!id) throw new Error('No se pudo crear el carrito de invitado');
  return id;
}

export async function addDataToCart(params) {
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
    email,
    carrier_code = 'envios',
    method_code = 'inter',
    payment_code = 'cashondelivery',
  } = params;

  const variables = {
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
    email,
    carrier_code,
    method_code,
    payment_code,
  };

  await graphqlClient.request(ADD_DATA_TO_CART, variables, { Authorization: '' });
  return true;
}

export async function placeOrder(cartId) {
  const data = await graphqlClient.request(PLACE_ORDER, { cartId }, { Authorization: '' });
  const errors = data?.placeOrder?.errors ?? [];
  if (errors.length) {
    const first = errors[0]?.message ?? 'Error al colocar la orden';
    throw new Error(first);
  }
  const orderId = data?.placeOrder?.orderV2?.id;
  if (!orderId) throw new Error('No se recibió el id de la orden');
  return orderId;
}

export async function assignWarehouseOrder(magento_order_id, token) {
  if (!token) throw new Error('Token requerido para asignar orden al warehouse');

  const data = await graphqlClient.request(
    ASSIGN_WAREHOUSE_ORDER,
    { magento_order_id },
    { Authorization: `Bearer ${token}` }
  );
  const res = data?.assignWarehouseOrder;
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo asignar la orden al warehouse');
  }
  return res;
}
