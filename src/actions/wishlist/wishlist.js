'use client';

import graphqlClient from 'src/lib/graphqlClient';

import {
  GET_WISHLISTS
} from './queries';
import {
  CREATE_WISHLIST,
  DELETE_WISHLIST,
  UPDATE_WISHLIST,
  ADD_PRODUCTS_TO_WISHLIST,
  REMOVE_PRODUCTS_FROM_WISHLIST,
} from './mutations'; // queries.js contains both queries & mutations in your snapshot

function formatGraphqlError(prefix, err) {
  const graphErrors = err?.response?.errors;
  const firstMsg = graphErrors?.[0]?.message || err?.message || 'Error desconocido';
  return { ok: false, error: `${prefix}: ${firstMsg}`, raw: { status: err?.response?.status, errors: graphErrors } };
}

/**
 * Funciones de bajo nivel que llaman al cliente GraphQL y lanzan / devuelven errores normalizados.
 * Estas se usan desde los hooks React Query.
 */

export async function fetchWishlists() {
  try {
    const res = await graphqlClient.request(GET_WISHLISTS);
    const items = res?.customer?.wishlists ?? [];
    return items;
  } catch (err) {
    // Si hay partial data, devolverla; si no, propagar como Error
    const partial = err?.response?.data?.customer?.wishlists;
    if (partial) return partial;
    throw new Error(formatGraphqlError('Error cargando wishlists', err).error);
  }
}

export async function createWishlist({ name, visibility = 'PRIVATE' }) {
  try {
    const res = await graphqlClient.request(CREATE_WISHLIST, { name, visibility });
    const wl = res?.createWishlist?.wishlist ?? null;
    if (!wl) throw new Error('No se creó la wishlist');
    return wl;
  } catch (err) {
    throw new Error(formatGraphqlError('Error creando wishlist', err).error);
  }
}

export async function deleteWishlist({ wishlistId }) {
  try {
    const res = await graphqlClient.request(DELETE_WISHLIST, { wishlistId });
    return res?.deleteWishlist ?? null;
  } catch (err) {
    throw new Error(formatGraphqlError('Error eliminando wishlist', err).error);
  }
}

export async function updateWishlist({ wishlistId, name, visibility }) {
  try {
    const res = await graphqlClient.request(UPDATE_WISHLIST, { wishlistId, name, visibility });
    return res?.updateWishlist ?? null;
  } catch (err) {
    throw new Error(formatGraphqlError('Error actualizando wishlist', err).error);
  }
}

export async function addProductsToWishlist({ wishlistId, items = [] }) {
  if (!wishlistId) throw new Error('wishlistId es requerido');
  if (!Array.isArray(items) || items.length === 0) throw new Error('No hay items para agregar');

  const wishlistItems = items.map((it) => ({ sku: it.sku, quantity: Number(it.quantity || 1) }));

  try {
    const res = await graphqlClient.request(ADD_PRODUCTS_TO_WISHLIST, { wishlistId, wishlistItems });
    const wl = res?.addProductsToWishlist?.wishlist ?? null;
    if (!wl) throw new Error('No se pudo agregar productos a la wishlist');
    return wl;
  } catch (err) {
    throw new Error(formatGraphqlError('Error agregando productos a wishlist', err).error);
  }
}

export async function removeProductsFromWishlist({ wishlistId, wishlistItemsIds = [] }) {
  if (!wishlistId) throw new Error('wishlistId es requerido');
  try {
    const res = await graphqlClient.request(REMOVE_PRODUCTS_FROM_WISHLIST, { wishlistId, wishlistItemsIds });
    const wl = res?.removeProductsFromWishlist?.wishlist ?? null;
    if (!wl) throw new Error('No se pudo remover productos de la wishlist');
    return wl;
  } catch (err) {
    throw new Error(formatGraphqlError('Error removiendo productos de wishlist', err).error);
  }
}

/**
 * addProductsToWishlists: paralelo sobre múltiples wishlistIds
 * - Retorna array de resultados (o lanza si alguna promesa falla).
 */
export async function addProductsToWishlists({ wishlistIds = [], items = [] }) {
  if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
    throw new Error('wishlistIds es requerido');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items es requerido');
  }

  const promises = wishlistIds.map((wid) =>
    addProductsToWishlist({ wishlistId: wid, items })
  );

  const results = await Promise.all(promises);
  return results;
}
