'use client';

import { gql } from 'graphql-request';

// Crear wishlist (visibility non-null según tu servidor)
export const CREATE_WISHLIST = gql`
  mutation CreateWishlist($name: String!, $visibility: WishlistVisibilityEnum!) {
    createWishlist(input: { name: $name, visibility: $visibility }) {
      wishlist {
        id
        items_count
        name
        sharing_code
        updated_at
        visibility
      }
    }
  }
`;

// Delete wishlist
export const DELETE_WISHLIST = gql`
  mutation DeleteWishlist($wishlistId: ID!) {
    deleteWishlist(wishlistId: $wishlistId) {
      status
      wishlists {
        id
        items_count
        name
        sharing_code
        updated_at
        visibility
      }
    }
  }
`;

// Remove products from wishlist
export const REMOVE_PRODUCTS_FROM_WISHLIST = gql`
  mutation RemoveProductsFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
    removeProductsFromWishlist(wishlistId: $wishlistId, wishlistItemsIds: $wishlistItemsIds) {
      wishlist {
        id
        items_count
        name
        sharing_code
        updated_at
        visibility
      }
    }
  }
`;

// Update wishlist (name, visibility)
export const UPDATE_WISHLIST = gql`
  mutation UpdateWishlist($wishlistId: ID!, $name: String, $visibility: WishlistVisibilityEnum) {
    updateWishlist(wishlistId: $wishlistId, name: $name, visibility: $visibility) {
      name
      uid
      visibility
    }
  }
`;

// Add products to wishlist
// NOTE: $wishlistId now non-null (ID!), matches servidor
export const ADD_PRODUCTS_TO_WISHLIST = gql`
  mutation AddProductsToWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemInput!]!) {
    addProductsToWishlist(wishlistId: $wishlistId, wishlistItems: $wishlistItems) {
      wishlist {
        id
        items_count
        name
        items_v2 {
          items {
            id
            quantity
            added_at
            product {
              name
              sku
              mgs_brand
              provider {
                id
                name
              }
              price {
                regularPrice {
                  amount {
                    value
                    currency
                  }
                }
              }
              stock_saleable
            }
          }
        }
      }
    }
  }
`;
