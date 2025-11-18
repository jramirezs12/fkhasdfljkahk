import axios from 'src/lib/axios';

/**
 * Sube productos al endpoint externo.
 * @param {Object} params
 * @param {File|Blob} params.csvFile - Archivo CSV (File/Blob)
 * @param {File|Blob} params.imagesZipFile - Archivo ZIP con imágenes (File/Blob)
 * @param {string|number} params.warehouseId - ID de bodega, p. ej. 1
 * @param {Object} [params.options] - Opcionales axios config (onUploadProgress, etc.)
 * @returns {Promise<{ ok: boolean, data?: any, status?: number, message?: string }>}
 */
export async function uploadProduct({ csvFile, imagesZipFile, warehouseId = 1, options = {} }) {
  const formData = new FormData();
  formData.append('csv', csvFile);
  formData.append('images_zip', imagesZipFile);
  formData.append('warehouse_id', String(warehouseId));

  try {
    const res = await axios.post(
      'https://mcstaging.alcarrito.com/rest/V1/import/products',
      formData,
      {
        // Nota: axios asigna el boundary automáticamente al pasar FormData.
        headers: { 'Content-Type': 'multipart/form-data' },
        ...options,
      }
    );

    return { ok: true, data: res.data, status: res.status };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Error al cargar productos';
    return { ok: false, status, message };
  }
}

export default uploadProduct;
