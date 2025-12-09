'use client';

import { useMutation } from '@tanstack/react-query';

import { useUploadStore } from 'src/store//uploadStore';

import uploadProductFn from './uploadProducts';

/**
 * useUploadProduct (hook)
 * - Encapsula la llamada de uploadProduct con react-query
 * - Actualiza uploadStore con progreso y estado
 *
 * usage:
 * const upload = useUploadProduct();
 * upload.mutate(formPayload);
 */
export function useUploadProduct(options = {}) {
  const startUpload = useUploadStore((s) => s.startUpload);
  const setProgress = useUploadStore((s) => s.setProgress);
  const finishUpload = useUploadStore((s) => s.finishUpload);
  const setError = useUploadStore((s) => s.setError);
  const addJob = useUploadStore((s) => s.addJob);

  return useMutation({
    mutationKey: ['upload', 'products'],
    mutationFn: async (payload) => {
      // payload: { csvFile, imagesZipFile, warehouseId, options }
      const onUploadProgress = (pct) => setProgress(pct);
      const opts = { ...(payload.options || {}), onUploadProgress };
      startUpload();
      setProgress(0);
      const res = await uploadProductFn({ ...payload, options: opts });
      return res;
    },
    onSuccess: (res) => {
      if (res?.ok) {
        finishUpload();
        // backend may return a job or similar; if so, add to jobs
        if (res.data?.job) {
          addJob(res.data.job);
        }
        if (typeof options.onSuccess === 'function') options.onSuccess(res);
      } else {
        setError(res?.message ?? 'Upload failed');
        if (typeof options.onError === 'function') options.onError(res);
      }
    },
    onError: (err) => {
      setError(err?.message ?? String(err));
      if (typeof options.onError === 'function') options.onError(err);
    },
    onSettled: () => {
      // opcional: dejar progreso al 100 o resetear después de X tiempo desde UI
      if (typeof options.onSettled === 'function') options.onSettled();
    },
  });
}

export default useUploadProduct;
