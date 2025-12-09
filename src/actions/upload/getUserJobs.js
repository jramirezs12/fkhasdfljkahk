import axios from 'src/lib/axios';

export async function getUserJobs({ params } = {}) {
  // params reserved for future (paging/filter)
  try {
    const resp = await axios.get('/api/import-user-jobs');
    // backend returns an array of jobs
    return { ok: true, status: resp.status, data: resp.data };
  } catch (err) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? null;
    return { ok: false, status, data, message: data?.message ?? err?.message ?? 'fetch error' };
  }
}

export default getUserJobs;
