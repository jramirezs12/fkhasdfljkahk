'use client';

/**
 * Upload store (Zustand)
 * - Guarda estado de upload actual (progress, status) y listado de jobs obtenidos del backend.
 * - Permite que UI muestre progreso/estado sin pasar props.
 */
import { create } from 'zustand';

export const useUploadStore = create((set, get) => ({
  // estado de upload actual
  isUploading: false,
  progress: 0, // 0..100
  status: null, // 'idle' | 'uploading' | 'success' | 'error'
  error: null,
  // jobs obtenidos del backend
  jobs: [],

  // acciones
  startUpload: () =>
    set(() => ({ isUploading: true, progress: 0, status: 'uploading', error: null })),
  setProgress: (p) => set(() => ({ progress: Math.max(0, Math.min(100, p)) })),
  setStatus: (s) => set(() => ({ status: s })),
  setError: (err) => set(() => ({ error: err, status: 'error', isUploading: false })),
  finishUpload: () => set(() => ({ isUploading: false, progress: 100, status: 'success' })),
  reset: () => set(() => ({ isUploading: false, progress: 0, status: null, error: null })),

  setJobs: (jobs) => set(() => ({ jobs: Array.isArray(jobs) ? jobs : [] })),
  addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs] })),
  clearJobs: () => set(() => ({ jobs: [] })),
}));
