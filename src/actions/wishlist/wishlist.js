'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_WISHLISTS } from './queries';
import {
  CREATE_WISHLIST,
  DELETE_WISHLIST,
  UPDATE_WISHLIST,
  ADD_PRODUCTS_TO_WISHLIST,
  REMOVE_PRODUCTS_FROM_WISHLIST,
} from './mutations';


export async function fetchWishlists() {
  const res = await graphqlClient.request(GET_WISHLISTS);
  return res?.customer?.wishlists ?? [];
}

export async function createWishlist({ name, visibility = 'PRIVATE' }) {
  const variables = { name, visibility };
  const res = await graphqlClient.request(CREATE_WISHLIST, variables);
  return res?.createWishlist?.wishlist ?? null;
}

export async function deleteWishlist({ wishlistId }) {
  const res = await graphqlClient.request(DELETE_WISHLIST, { wishlistId });
  return res?.deleteWishlist ?? null;
}

export async function removeProductsFromWishlist({ wishlistId, wishlistItemsIds = [] }) {
  const res = await graphqlClient.request(REMOVE_PRODUCTS_FROM_WISHLIST, {
    wishlistId,
    wishlistItemsIds,
  });
  return res?.removeProductsFromWishlist?.wishlist ?? null;
}

export async function updateWishlist({ wishlistId, name, visibility }) {
  const res = await graphqlClient.request(UPDATE_WISHLIST, { wishlistId, name, visibility });
  return res?.updateWishlist ?? null;
}

export async function addProductsToWishlist({ wishlistId, items = [] }) {
  if (!wishlistId) throw new Error('wishlistId es requerido');
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No hay items para agregar');
  }
  const wishlistItems = items.map((it) => ({ sku: it.sku, quantity: Number(it.quantity || 1) }));
  const res = await graphqlClient.request(ADD_PRODUCTS_TO_WISHLIST, {
    wishlistId,
    wishlistItems,
  });
  return res?.addProductsToWishlist?.wishlist ?? null;
}

export async function addProductsToWishlists({ wishlistIds = [], items = [] }) {
  if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
    throw new Error('wishlistIds es requerido');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items es requerido');
  }

  // Ejecutar paralelamente una llamada por wishlistId
  const promises = wishlistIds.map((wid) =>
    addProductsToWishlist({ wishlistId: wid, items })
  );

  // Promise.all para lanzar todas; retornamos array de resultados
  const results = await Promise.all(promises);
  return results; // array de wishlist responses
}
