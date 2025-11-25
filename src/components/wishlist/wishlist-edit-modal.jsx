'use client';

import { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { updateWishlist, deleteWishlist } from 'src/actions/wishlist/wishlist';

import { toast } from 'src/components/snackbar';

/**
 * Modal para editar (update) una wishlist (name + visibility)
 *
 * Props:
 * - open (bool)
 * - onClose() callback
 * - wishlist { id, name, visibility }
 * - onUpdated(updatedWishlist) optional callback
 * - onDeleted() optional callback (called after delete)
 */
export function WishlistEditModal({ open, onClose, wishlist = null, onUpdated, onDeleted }) {
  const { mutate } = useSWRConfig();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Initialize local state when modal opens or wishlist changes.
  useEffect(() => {
    if (open && wishlist) {
      setName(wishlist.name ?? '');
      setVisibility(wishlist.visibility ?? 'PRIVATE');
    }
    if (!open) {
      // clear local state when closed to avoid stale values
      setName('');
      setVisibility('PRIVATE');
    }
  }, [open, wishlist]);

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!wishlist?.id) {
      toast.error('Wishlist inválida');
      return;
    }
    if (!String(name || '').trim()) {
      toast.error('Nombre requerido');
      return;
    }
    setLoading(true);
    try {
      const res = await updateWishlist({ wishlistId: wishlist.id, name: String(name).trim(), visibility });
      toast.success('Lista actualizada');
      await mutate('wishlists');
      if (typeof onUpdated === 'function') onUpdated(res);
      onClose?.();
    } catch (err) {
      // GraphQL errors might be in err.response.errors
      const msg = err?.response?.errors?.[0]?.message || err?.message || 'Error actualizando la lista';
      console.error('[WishlistEditModal update] ', err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!wishlist?.id) return;
    if (!confirm('¿Eliminar esta lista? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      const res = await deleteWishlist({ wishlistId: wishlist.id });
      // If backend returns null but provides errors, deleteWishlist may throw; handle both.
      await mutate('wishlists');
      toast.success('Lista eliminada');
      if (typeof onDeleted === 'function') onDeleted(res);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.errors?.[0]?.message || err?.message || 'Error eliminando la lista';
      console.error('[WishlistEditModal delete] ', err);
      toast.error(msg);
      // don't close modal on error (e.g. default wishlist can't be deleted)
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar lista</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Modifica el nombre y la visibilidad de la lista.
        </Typography>

        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Nombre de la lista"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            size="small"
            fullWidth
            required
            inputProps={{ maxLength: 255 }}
          />

          <TextField
            select
            label="Visibilidad"
            value={visibility}
            onChange={(ev) => setVisibility(ev.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="PRIVATE">Privada</MenuItem>
            <MenuItem value="PUBLIC">Pública</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={handleDelete} color="error" disabled={deleting}>
              {deleting ? <CircularProgress size={16} /> : 'Eliminar lista'}
            </Button>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button onClick={onClose} disabled={loading || deleting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading || deleting}>
                {loading ? <CircularProgress size={16} /> : 'Guardar'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
