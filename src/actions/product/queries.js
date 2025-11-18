import { gql } from 'graphql-request';

export const PRODUCT_LIST = gql`
  query productListAux($currentPage: Int!, $pageSize: Int!, $filter: ProductAttributeFilterInput!) {
    products(currentPage: $currentPage, pageSize: $pageSize, filter: $filter) {
      page_info { total_pages }
      items {
        name
        sku
        uid
        image { url }
        stock_saleable
        categories { name uid }
        price_range {
          minimum_price {
            regular_price { value }
            final_price { value }
          }
        }
      }
      total_count
    }
  }
`;

export const PRODUCT_BY_SKU = gql`
  query productVariants($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      total_count
      items {
        __typename
        id
        uid
        sku
        name
        stock_status
        stock_saleable
        categories {
          name
          uid
          level
        }
        price_range {
          minimum_price {
            regular_price { value }
            final_price { value }
            discount { amount_off percent_off }
          }
        }
        custom_attributes_info {
          items { code value }
        }
        image { url }
        ... on ConfigurableProduct {
          configurable_product_options_selection {
            configurable_options {
              uid
              label
              frontend_input
              values {
                label
                is_available
                uid
                swatch { image_url }
              }
            }
          }
          variants {
            product {
              __typename
              stock_saleable
              sku
              name
              categories { name uid level }
              price_range {
                minimum_price {
                  regular_price { value }
                  final_price { value }
                  discount { amount_off percent_off }
                }
              }
              image { url }
              stock_status
            }
            attributes { uid }
          }
        }
        media_gallery {
          disabled
          label
          position
          url
        }
      }
    }
  }
`;

export const SHIPPING_QUOTE_MUTATION = gql`
query ShippingQuote($destinationCityName: String!, $qty: Int!, $productId: Int!) {
    shippingQuote(
        dataForQuote: {
            destinationCityName: $destinationCityName
            qty: $qty
            productId: $productId
        }
    )   {
        dateDelivery
        deliveryDays
        price
    }
}
`;

export const CREATE_SIMPLE_PRODUCT_MUTATION = gql`
  mutation CreateSimpleProduct (
    $name: String!,
    $categoryId: String!,
    $sku: String!,
    $price: Float!,
    $sucursal: Int!,
    $descripcionCorta: String!,
    $descripcion: String!,
    $qty: Float!,
    $inStock: Boolean!,
    $mediaGallery: [MediaGalleryEntryInput!]!
  ) {
    createSimpleProduct(
      input:{
        product:{
          name: $name
          attribute_set_id: 4
          sku: $sku
          price: $price
          type_id: "simple"
          weight: 1
          visibility: 4
          status: 1
          extension_attributes: {
            category_links: [
              {
                position: 0
                category_id: $categoryId
              }
            ]
            stock_item: {
              qty: $qty
              is_in_stock: $inStock
            }
          }
          custom_attributes:[
            {
                attribute_code: "description"
                value: $descripcion
            },
            {
                attribute_code: "short_description"
                value: $descripcionCorta 
            }
          ]
          media_gallery_entries: $mediaGallery
        }
        warehouse_id: $sucursal
      }
    ),
    {
      sku
      success
      message
    }
  }
`;