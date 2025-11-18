'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_SIMPLE_PRODUCT_MUTATION } from './queries';

export const createProduct = async ({ nombre, categoryId, sucursal, sku, precio, stock, descripcionCorta, descripcion, imagenes, files }) => {
    const mediaGallery = files.map((file, index) => {
        const label = file.name.replace(/\.[^/.]+$/, "");
        return {            
            media_type: "image",
            label,
            position: index,
            disabled: false,
            types: index == 0 ? ["image", "small_image", "thumbnail"] : ["image"],
            content: {
                base64_encoded_data: imagenes[index],
                type: file.type,
                name: file.name
            }
        };
    });

    console.log('MEDIA GALLERY ENTRIES:', mediaGallery);

    const variables = {
        name: nombre,
        categoryId,
        sku,
        price: parseFloat(precio),
        sucursal: parseInt(sucursal),
        descripcionCorta,
        descripcion,
        qty: parseFloat(stock),
        inStock: parseFloat(stock) > 0 ? true : false,
        mediaGallery
    };

    try {
        const result = await graphqlClient.request(CREATE_SIMPLE_PRODUCT_MUTATION, variables);
        console.log('RESULT GRAPHQL:', result);
        const data = result.createSimpleProduct;

        if (!data.success) {
            console.error(data);
            throw new Error('Error al crear producto');
        }
        return true;
    } catch (error) {
        console.error(error);
        throw error.response.errors[0].message;
    }
};