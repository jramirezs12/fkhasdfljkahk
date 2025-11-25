'use client';

import { gql } from 'graphql-request';

export const GET_WISHLISTS = gql`
  {
    customer {
        wishlists(pageSize: 20, currentPage: 1) {
            id
            name
            visibility
            items_count
            updated_at
            sharing_code
            items_v2 {
                items {
                    added_at
                    description
                    id
                    quantity
                    product {
                        categories {
                            name
                        }
                        id
                        name
                        price {
                            regularPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                        }
                        sku
                        image {
                            disabled
                            label
                            position
                            url
                        }
                        stock_saleable
                        stock_status
                        provider {
                            name
                        }
                    }
                }
            }
        }
    }
}

`;
