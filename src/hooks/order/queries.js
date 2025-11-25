'use client';

import { gql } from 'graphql-request';

export const GET_DROPSHIPPING_ORDERS = gql`
  query GetDropshippingOrders {
    getDropshippingOrders {
      total_count
      total_pages
      items {
        id
        order_number
        email
        status
        created_at
        items {
          id
          product_name
          product_sku
          quantity_ordered
          product {
            thumbnail {
              url
            }
          }
          product_sale_price {
            value
          }
        }
        shipping_address {
          firstname
          lastname
        }
        total {
          grand_total {
            value
          }
        }
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetDropshippingOrders($order_id: Int!) {
    getDropshippingOrders(order_id: $order_id) {
      items {
        id
        order_number
        email
        status
        created_at
        items {
          id
          product_name
          product_sku
          quantity_ordered
          product {
            thumbnail {
              url
            }
          }
          product_sale_price {
            value
          }
        }
        shipping_address {
          firstname
          lastname
          telephone
          street
          city
          region
        }
        shipments {
          tracking {
            number
            title
            carrier
          }
        }
        total {
          grand_total {
            value
          }
          taxes {
            amount {
              value
            }
            title
          }
          total_shipping {
            value
          }
          subtotal {
            value
          }
          discounts {
            amount {
              value
            }
            label
          }
        }
      }
    }
  }
`;