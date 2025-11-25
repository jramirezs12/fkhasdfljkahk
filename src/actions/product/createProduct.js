'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_SIMPLE_PRODUCT_MUTATION } from './queries';

export const createProduct = async ({ name, categoryId, warehouse, sku, price, stock, shortDescription, description, images, files }) => {
    const mediaGallery = files.map((file, index) => {
        const label = file.name.replace(/\.[^/.]+$/, "");
        return {            
            media_type: "image",
            label,
            position: index,
            disabled: false,
            types: index == 0 ? ["image", "small_image", "thumbnail"] : ["image"],
            content: {
                base64_encoded_data: images[index],
                type: file.type,
                name: file.name
            }
        };
    });

    const variables = {
        name,
        categoryId,
        sku,
        price: parseFloat(price),
        warehouse: parseInt(warehouse),
        shortDescription,
        description,
        qty: parseFloat(stock),
        inStock: parseFloat(stock) > 0 ? true : false,
        mediaGallery
    };

    try {
        const result = await graphqlClient.request(CREATE_SIMPLE_PRODUCT_MUTATION, variables);
        const data = result.createSimpleProduct;

        if (!data.success) {
            console.error(data);
            throw new Error('Error al crear producto');
        }
        return true;
    } catch (error) {
        console.error(error);
        if (error.response?.errors && error.response.errors.length > 0)
            throw error.response.errors[0].message;
        throw new Error('Error al crear producto');
    }
};