'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { CREATE_SIMPLE_PRODUCT_MUTATION } from './queries';

/**
 * createProduct
 * - Construye mediaGallery a partir de files + base64 images
 * - Lanza errores legibles (string) para que UI los muestre
 * - Devuelve el sku creado en éxito
 */
export const createProduct = async ({
  name,
  categoryId,
  warehouse,
  sku,
  price,
  stock,
  shortDescription,
  description,
  images = [], // array base64 (sin prefix)
  files = [], // File objects (must align with images)
} = {}) => {
  if (!name || !sku || !categoryId) {
    throw new Error('Faltan campos obligatorios: nombre, sku o categoría');
  }

  const mediaGallery = (files || []).map((file, index) => {
    const label = (file && file.name) ? file.name.replace(/\.[^/.]+$/, '') : `${sku}-${index}`;
    return {
      media_type: 'image',
      label,
      position: Number(index || 0),
      disabled: false,
      types: index === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
      content: {
        base64_encoded_data: images?.[index] ?? '',
        type: file?.type ?? 'image/png',
        name: file?.name ?? `${label}.png`,
      },
    };
  });

  const variables = {
    name,
    categoryId: String(categoryId),
    sku: String(sku),
    price: parseFloat(price) || 0,
    warehouse: Number.isFinite(Number(warehouse)) ? Number(warehouse) : 0,
    shortDescription: shortDescription ?? '',
    description: description ?? '',
    qty: Number(stock) || 0,
    inStock: Number(stock) > 0,
    mediaGallery,
  };

  try {
    const result = await graphqlClient.request(CREATE_SIMPLE_PRODUCT_MUTATION, variables);
    const data = result?.createSimpleProduct;
    if (!data) {
      throw new Error('Respuesta inesperada del servidor al crear producto');
    }
    if (!data.success) {
      // mensaje entregado por magento
      const msg = data.message || 'Error al crear producto';
      throw new Error(msg);
    }
    // devuelve sku u ok
    return { sku: data.sku || sku, success: true };
  } catch (error) {
    // GraphQL ClientError shape: error.response.errors
    if (error?.response?.errors && error.response.errors.length > 0) {
      const upstream = error.response.errors[0]?.message;
      throw new Error(upstream || 'Error al crear producto');
    }
    // fallback
    throw new Error(error?.message || 'Error al crear producto');
  }
};

export default createProduct;
