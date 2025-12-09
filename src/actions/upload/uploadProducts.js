'use client';

import axios from 'src/lib/axios';

/**
 * uploadProduct - low level upload function using axios and returning response
 * - Accepts onUploadProgress callback in options to receive progress events (0..100)
 * - Returns { ok, status, data, message } shape for caller consistency
 *
 * Note: This is client-only (uses browser FormData and axios)
 */
export async function uploadProduct({ csvFile, imagesZipFile, warehouseId = 1, options = {} } = {}) {
  if (typeof window === 'undefined') {
    throw new Error('uploadProduct should be called from the client');
  }

  const form = new FormData();
  if (csvFile) form.append('csv', csvFile);
  if (imagesZipFile) form.append('images_zip', imagesZipFile);
  form.append('warehouse_id', String(warehouseId));
  form.append('options', JSON.stringify(options || {}));

  try {
    const resp = await axios.post('/api/import-products', form, {
      // axios exposes progressEvent.loaded and total
      onUploadProgress: (ev) => {
        if (typeof options.onUploadProgress === 'function') {
          const pct = ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0;
          options.onUploadProgress(pct, ev);
        }
      },
      // don't set Content-Type: browser sets multipart boundary
    });

    return { ok: true, status: resp.status, data: resp.data, message: resp.data?.message || 'OK' };
  } catch (err) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? null;
    const message = data?.message ?? err?.message ?? 'upload error';
    return { ok: false, status, data, message };
  }
}

export default uploadProduct;
