export function unique(arr = []) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

export function num(n, d = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}

export function parseCustomAttributes(items = []) {
  const byCode = (code) => {
    const it = (items || []).find((i) => i?.code === code);
    return it ? it.value : null;
  };
  return {
    description: byCode('description') || byCode('short_description') || '',
    providerAttr: byCode('provider') || byCode('proveedor') || byCode('vendor') || null,
    rawPriceAttr: byCode('price') ?? null,
  };
}

export function adaptProductFromMagento(raw) {
  if (!raw) return null;

  const min = raw.price_range?.minimum_price;
  const regular = num(min?.regular_price?.value, 0);
  const final = num(min?.final_price?.value, regular);
  const { rawPriceAttr, description, providerAttr } = parseCustomAttributes(
    raw.custom_attributes_info?.items || []
  );
  const providerPrice = final || regular || num(rawPriceAttr, 0);
  const suggestedPrice = providerPrice * 1.80;

  const media = Array.isArray(raw.media_gallery) ? raw.media_gallery : [];
  const galleryUrls = media
    .filter((m) => !m.disabled && m?.url)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((m) => m.url);

  if (galleryUrls.length === 0) {
    const baseImage = raw.image?.url || null;
    const variantImages =
      (Array.isArray(raw.variants) ? raw.variants.map((v) => v?.product?.image?.url).filter(Boolean) : []) || [];
    galleryUrls.push(...unique([baseImage, ...variantImages]));
  }

  const cfg = raw.configurable_product_options_selection?.configurable_options || [];
  const pickValues = (needle) =>
    (cfg.find((o) => String(o?.label || '').toLowerCase().includes(needle))?.values || [])
      .map((v) => v?.label)
      .filter(Boolean);

  const colors = pickValues('color');
  const sizes = pickValues('size');
  const available = num(raw.stock_saleable, 0);
  const stockStatus = String(raw.stock_status || '').toUpperCase();
  const inventoryType = available > 0 || stockStatus === 'IN_STOCK' ? 'in stock' : 'out of stock';

  let provider = null;
  const rawProvider = raw?.provider ?? null;
  if (rawProvider) {
    if (typeof rawProvider === 'object') {
      provider = {
        id: rawProvider.id ?? rawProvider.uid ?? null,
        // eslint-disable-next-line no-constant-binary-expression
        name: rawProvider.name ?? rawProvider.label ?? String(rawProvider) ?? null,
        image: rawProvider?.image?.url ?? null,
        warehouse_product: rawProvider?.warehouse_product ?? null,
      };
    } else {
      provider = { id: null, name: String(rawProvider) };
    }
  } else if (providerAttr) {
    provider = { id: null, name: providerAttr };
  } else if (Array.isArray(raw.categories) && raw.categories[0]?.name) {
    provider = { id: null, name: raw.categories[0].name };
  }

  let warehouseId = null;
  try {
    const wp = provider?.warehouse_product ?? raw.provider?.warehouse_product ?? null;
    if (Array.isArray(wp) && wp.length > 0) {
      warehouseId = wp[0]?.warehouse_id ?? null;
    } else if (wp && typeof wp === 'object') {
      warehouseId = wp.warehouse_id ?? null;
    }
    if (warehouseId !== null) warehouseId = String(warehouseId);
  } catch {
    warehouseId = null;
  }

  const percentOff = num(min?.discount?.percent_off, 0);
  const saleLabel = { enabled: percentOff > 0, content: percentOff > 0 ? `${percentOff}% OFF` : '' };
  const newLabel = { enabled: false, content: '' };

  return {
    id: raw.id ?? '',
    uid: raw.uid ?? '',
    sku: raw.sku ?? '',
    name: raw.name ?? '',
    provider,
    providerPrice,
    suggestedPrice,
    warehouseId,
    images: unique(galleryUrls),
    available,
    inventoryType,
    colors,
    sizes,
    description,
    subDescription: '',
    saleLabel,
    newLabel,
    ratings: [],
    reviews: [],
    totalRatings: 0,
    totalReviews: 0,
    categories: raw.categories || [],
    publish: 'published',
  };
}

export function adaptItem(item) {
  if (!item) return null;
  const minPrice = item?.price_range?.minimum_price;
  const price = (minPrice?.final_price?.value ?? minPrice?.regular_price?.value) ?? 0;
  const cover = item?.image?.url ?? (Array.isArray(item?.media_gallery) && item.media_gallery[0]?.url) ?? null;
  const available = num(item?.stock_saleable ?? 0);
  const sku = item?.sku ?? '';
  const uid = item?.uid ?? '';
  const id = sku || uid || String(item?.id ?? '');

  const provider = item?.provider ?? null;

  let warehouseId = null;
  try {
    const wp = provider?.warehouse_product ?? item?.provider?.warehouse_product ?? null;
    if (Array.isArray(wp) && wp.length > 0) {
      warehouseId = wp[0]?.warehouse_id ?? null;
    } else if (wp && typeof wp === 'object') {
      warehouseId = wp.warehouse_id ?? null;
    }
    if (warehouseId !== null && warehouseId !== undefined) warehouseId = String(warehouseId);
    else warehouseId = null;
  } catch {
    warehouseId = null;
  }

  return {
    id,
    uid,
    sku,
    name: item?.name ?? '',
    coverUrl: cover,
    price,
    priceSale: null,
    available,
    inventoryType: available > 0 ? 'in stock' : 'out of stock',
    createdAt: item?.createdAt ?? null,
    categories: item?.categories ?? [],
    media_gallery: item?.media_gallery ?? [],
    provider,
    warehouseId,
    warehouseCity: null,
  };
}
