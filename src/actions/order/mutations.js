'use client';

import { gql } from 'graphql-request';

// Crear carrito de invitado (sin token)
export const CREATE_GUEST_CART = gql`
  mutation CreateGuestCart {
    createGuestCart {
      cart {
        id
        email
        is_virtual
        total_quantity
        billing_address {
          city
        }
      }
    }
  }
`;

export const ADD_DATA_TO_CART = gql`
  mutation AddDataToCart(
    $cartId: String!
    $quantity: Float!
    $sku: String!
    $dropper_price: Float!
    $firstname: String!
    $lastname: String!
    $street: [String!]!
    $city: String!
    $region_id: Int!
    $telephone: String!
    $email: String!
    $carrier_code: String!
    $method_code: String!
    $payment_code: String!
  ) {
    dropshippingAddProductsToCart(
      cartItems: [{ quantity: $quantity, sku: $sku, dropper_price: $dropper_price }]
      cartId: $cartId
    ) {
      cart { id }
    }

    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [
          {
            address: {
              firstname: $firstname
              lastname: $lastname
              street: $street
              city: $city
              region_id: $region_id
              country_code: "CO"
              telephone: $telephone
            }
          }
        ]
      }
    ) {
      cart { id }
    }

    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: $street
            city: $city
            region_id: $region_id
            country_code: "CO"
            telephone: $telephone
          }
        }
      }
    ) {
      cart { id }
    }

    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: { carrier_code: $carrier_code, method_code: $method_code }
      }
    ) {
      cart {
        id
        shipping_addresses {
          region { label }
          city
          street
        }
      }
    }

    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart { id }
    }

    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $payment_code } }) {
      cart { id }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      errors { message }
      orderV2 { id }
    }
  }
`;


export const ASSIGN_WAREHOUSE_ORDER = gql`
  mutation AssignWarehouseOrder($magento_order_id: ID!) {
    assignWarehouseOrder(input: { magento_order_id: $magento_order_id }) {
      message
      success
      warehouse_order_id
    }
  }
`;

/**
 * Query to get customer cart id for logged in customers
 */
export const CUSTOMER_CART_QUERY = gql`
  query CustomerCart {
    customerCart {
      id
    }
  }
`;

/**
 * Two variants of "add data to cart":
 * - For guests: includes setGuestEmailOnCart
 * - For authenticated customers: omit setGuestEmailOnCart (not allowed for logged customers)
 */
export const ADD_DATA_TO_CART_GUEST = gql`
  mutation AddDataToCart(
    $cartId: String!
    $quantity: Float!
    $sku: String!
    $dropper_price: Float!
    $firstname: String!
    $lastname: String!
    $street: [String!]!
    $city: String!
    $region_id: Int!
    $telephone: String!
    $email: String!
    $carrier_code: String!
    $method_code: String!
    $payment_code: String!
  ) {
    dropshippingAddProductsToCart(
      cartItems: [{ quantity: $quantity, sku: $sku, dropper_price: $dropper_price }]
      cartId: $cartId
    ) {
      cart { id }
    }

    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [
          {
            address: {
              firstname: $firstname
              lastname: $lastname
              street: $street
              city: $city
              region_id: $region_id
              country_code: "CO"
              telephone: $telephone
            }
          }
        ]
      }
    ) {
      cart { id }
    }

    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: $street
            city: $city
            region_id: $region_id
            country_code: "CO"
            telephone: $telephone
          }
        }
      }
    ) {
      cart { id }
    }

    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: { carrier_code: $carrier_code, method_code: $method_code }
      }
    ) {
      cart {
        id
        shipping_addresses {
          region { label }
          city
          street
        }
      }
    }

    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart { id }
    }

    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $payment_code } }) {
      cart { id }
    }
  }
`;

export const ADD_DATA_TO_CART_CUSTOMER = gql`
  mutation AddDataToCartForCustomer(
    $cartId: String!
    $quantity: Float!
    $sku: String!
    $dropper_price: Float!
    $firstname: String!
    $lastname: String!
    $street: [String!]!
    $city: String!
    $region_id: Int!
    $telephone: String!
    $carrier_code: String!
    $method_code: String!
    $payment_code: String!
  ) {
    dropshippingAddProductsToCart(
      cartItems: [{ quantity: $quantity, sku: $sku, dropper_price: $dropper_price }]
      cartId: $cartId
    ) {
      cart { id }
    }

    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [
          {
            address: {
              firstname: $firstname
              lastname: $lastname
              street: $street
              city: $city
              region_id: $region_id
              country_code: "CO"
              telephone: $telephone
            }
          }
        ]
      }
    ) {
      cart { id }
    }

    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: $street
            city: $city
            region_id: $region_id
            country_code: "CO"
            telephone: $telephone
          }
        }
      }
    ) {
      cart { id }
    }

    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: { carrier_code: $carrier_code, method_code: $method_code }
      }
    ) {
      cart {
        id
        shipping_addresses {
          region { label }
          city
          street
        }
      }
    }

    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $payment_code } }) {
      cart { id }
    }
  }
`;
