// Archivo de servidor (NO 'use client')

import { headers } from 'next/headers';
import { GraphQLClient } from 'graphql-request';

import { PRODUCT_BY_SKU } from './queries';

// ---------- Helpers ----------
function unique(arr = []) {
  return Array.from(new Set(arr.filter(Boolean)));
}
function num(n, d = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}
function parseCustomAttributes(items = []) {
  const byCode = (code) => items.find((i) => i?.code === code)?.value || null;
  return {
    description:
      byCode('description') ||
      byCode('short_description') ||
      '',
    providerAttr:
      byCode('provider') ||
      byCode('proveedor') ||
      byCode('vendor') ||
      null,
    rawPriceAttr: byCode('price'),
  };
}

// ---------- Adaptador a la UI ----------
function adaptProductFromMagento(raw) {
  if (!raw) return null;

  // Precios base (proveedor)
  const min = raw.price_range?.minimum_price;
  const regular = num(min?.regular_price?.value, 0);
  const final = num(min?.final_price?.value, regular);
  const { rawPriceAttr, description, providerAttr } = parseCustomAttributes(
    raw.custom_attributes_info?.items || []
  );

  // Precio del proveedor: prioridad al final_price, luego regular_price, luego custom attr "price"
  const providerPrice = final || regular || num(rawPriceAttr, 0);
  const suggestedPrice = providerPrice * 2.09;

  // Imágenes desde media_gallery
  const media = Array.isArray(raw.media_gallery) ? raw.media_gallery : [];
  const galleryUrls = media
    .filter((m) => !m.disabled && m?.url)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((m) => m.url);

  // Fallback a imagen base/variantes si media_gallery viene vacío
  if (galleryUrls.length === 0) {
    const baseImage = raw.image?.url || null;
    const variantImages =
      raw.variants?.map((v) => v?.product?.image?.url).filter(Boolean) || [];
    galleryUrls.push(...unique([baseImage, ...variantImages]));
  }

  // Opciones configurables (si aplica)
  const cfg = raw.configurable_product_options_selection?.configurable_options || [];
  const pickValues = (needle) =>
    (cfg.find((o) => String(o?.label || '').toLowerCase().includes(needle))?.values || [])
      .map((v) => v?.label)
      .filter(Boolean);

  const colors = pickValues('color');
  const sizes = pickValues('size');

  // Stock
  const available = num(raw.stock_saleable, 0);
  const stockStatus = String(raw.stock_status || '').toUpperCase();
  const inventoryType =
    available > 0 || stockStatus === 'IN_STOCK' ? 'in stock' : 'out of stock';

  // Proveedor: intenta custom attr; si no, usa primera categoría como fallback
  const provider =
    providerAttr ||
    (Array.isArray(raw.categories) && raw.categories[0]?.name) ||
    null;

  // Labels (si quieres mantenerlos)
  const percentOff = num(min?.discount?.percent_off, 0);
  const saleLabel = {
    enabled: percentOff > 0,
    content: percentOff > 0 ? `${percentOff}% OFF` : '',
  };
  const newLabel = { enabled: false, content: '' };

  // Reviews (placeholder; completa cuando tengas fuente real)
  const ratings = [];
  const reviews = [];
  const totalRatings = 0;
  const totalReviews = 0;

  return {
    // Identificadores
    id: raw.id || '',
    uid: raw.uid || '',
    sku: raw.sku || '',
    name: raw.name || '',

    // Proveedor y precios
    provider,
    providerPrice,
    suggestedPrice,

    // Imágenes para el carrusel
    images: unique(galleryUrls),

    // Stock y estado
    available,
    inventoryType,

    // Variantes
    colors,
    sizes,

    // Descripciones
    description,
    subDescription: '',

    // UI labels (opcionales)
    saleLabel,
    newLabel,

    // Reviews
    ratings,
    reviews,
    totalRatings,
    totalReviews,

    // Categorías e info adicional
    categories: raw.categories || [],
    publish: 'published',
  };
}

// ---------- Resolver SSR del endpoint (idéntico a cliente con proxy) ----------
function resolveGraphqlUrlSSR() {
  // Igual que src/lib/graphqlClient: primero env, si no, usa host + /api/graphql-proxy
  let endpoint =
    process.env.NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL ||
    process.env.ALCARRITO_GRAPHQL_URL ||
    '';

  if (!endpoint) {
    try {
      const h = headers();
      const host = h.get('x-forwarded-host') || h.get('host');
      const proto = h.get('x-forwarded-proto') || 'http';
      if (host) endpoint = `${proto}://${host}/api/graphql-proxy`;
    } catch {
      endpoint = 'http://localhost:3000/api/graphql-proxy';
    }
  }

  // Validar url
  try {
    // eslint-disable-next-line no-new
    new URL(endpoint);
  } catch {
    throw new Error(
      `Endpoint GraphQL inválido: "${endpoint}". Define NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL o ALCARRITO_GRAPHQL_URL, o expón /api/graphql-proxy.`
    );
  }
  return endpoint;
}

// ---------- Acción SSR ----------
export async function getProduct(sku) {
  const endpoint = resolveGraphqlUrlSSR();

  const client = new GraphQLClient(endpoint, {
    headers: { 'Content-Type': 'application/json' },
  });

  const variables = { sku: String(sku) };

  let data;
  try {
    data = await client.request(PRODUCT_BY_SKU, variables);
  } catch (err) {
    console.error('[SSR getProduct] GraphQL error', {
      status: err?.response?.status,
      message: err?.message,
      endpoint,
    });
    return { product: null, error: { status: err?.response?.status || 500, message: err.message } };
  }

  const items = data?.products?.items || [];
  if (!items.length) return { product: null };

  return { product: adaptProductFromMagento(items[0]) };
}
