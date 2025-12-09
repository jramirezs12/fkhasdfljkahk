'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useWishlistStore } from 'src/store/wishlistStore';
import { fetchWishlists, createWishlist, deleteWishlist, updateWishlist, addProductsToWishlist, addProductsToWishlists, removeProductsFromWishlist } from 'src/actions/wishlist/wishlist';

/**
 * Hooks react-query para wishlist
 * - Mantienen el zustand store sincronizado para UI instantánea.
 */

// Key: ['wishlists']
export function useGetWishlists({ enabled = true } = {}) {
  const setWishlists = useWishlistStore((s) => s.setWishlists);

  return useQuery({
    queryKey: ['wishlists'],
    queryFn: async () => {
      const data = await fetchWishlists();
      return data;
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) setWishlists(data);
    },
    staleTime: 1000 * 60 * 2,
    enabled,
  });
}

export function useCreateWishlist(options = {}) {
  const qc = useQueryClient();
  const setWishlist = useWishlistStore((s) => s.setWishlist);

  return useMutation({
    mutationKey: ['wishlist', 'create'],
    mutationFn: (payload) => createWishlist(payload),
    onSuccess: async (created) => {
      try {
        setWishlist(created);
      } catch { /* empty */ }
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(created);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}

export function useDeleteWishlist(options = {}) {
  const qc = useQueryClient();
  const removeWishlist = useWishlistStore((s) => s.removeWishlist);

  return useMutation({
    mutationKey: ['wishlist', 'delete'],
    mutationFn: ({ wishlistId }) => deleteWishlist({ wishlistId }),
    onSuccess: async (res, vars) => {
      try {
        removeWishlist(vars.wishlistId);
      } catch { /* empty */ }
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(res);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}

export function useUpdateWishlist(options = {}) {
  const qc = useQueryClient();
  const setWishlist = useWishlistStore((s) => s.setWishlist);

  return useMutation({
    mutationKey: ['wishlist', 'update'],
    mutationFn: (payload) => updateWishlist(payload),
    onSuccess: async (updated) => {
      try {
        setWishlist(updated);
      } catch { /* empty */ }
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(updated);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}

export function useAddProductsToWishlist(options = {}) {
  const qc = useQueryClient();
  const setWishlist = useWishlistStore((s) => s.setWishlist);

  return useMutation({
    mutationKey: ['wishlist', 'addProducts'],
    mutationFn: ({ wishlistId, items }) => addProductsToWishlist({ wishlistId, items }),
    onSuccess: async (updated) => {
      try {
        setWishlist(updated);
      } catch { /* empty */ }
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(updated);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}

export function useRemoveProductsFromWishlist(options = {}) {
  const qc = useQueryClient();
  const setWishlist = useWishlistStore((s) => s.setWishlist);

  return useMutation({
    mutationKey: ['wishlist', 'removeProducts'],
    mutationFn: ({ wishlistId, wishlistItemsIds }) => removeProductsFromWishlist({ wishlistId, wishlistItemsIds }),
    onSuccess: async (updated) => {
      try {
        setWishlist(updated);
      } catch { /* empty */ }
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(updated);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}

/**
 * Bulk add to multiple wishlists in parallel
 */
export function useAddProductsToWishlists(options = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['wishlist', 'bulkAdd'],
    mutationFn: ({ wishlistIds, items }) => addProductsToWishlists({ wishlistIds, items }),
    onSuccess: async (results) => {
      // Invalidate lists to refresh updated counts/items
      await qc.invalidateQueries({ queryKey: ['wishlists'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(results);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
    },
    ...options,
  });
}
