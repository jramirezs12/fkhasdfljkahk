'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { createWishlist } from 'src/actions/wishlist/wishlist';

import { toast } from 'src/components/snackbar';

/**
 * WishlistCreateForm - formulario con layout vertical:
 * - Nombre en una fila
 * - Visibilidad en otra fila
 * - Botones en fila separada abajo, alineados a la derecha
 */
export function WishlistCreateForm({
  initialName = '',
  initialVisibility = 'PRIVATE',
  onCreated,
  onCancel,
  submitLabel = 'Crear lista',
}) {
  const { mutate } = useSWRConfig();
  const [name, setName] = useState(initialName);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim()) {
      toast.error('Nombre requerido');
      return;
    }
    setLoading(true);
    try {
      const created = await createWishlist({ name: name.trim(), visibility });
      toast.success('Lista creada');
      await mutate('wishlists');
      if (typeof onCreated === 'function') onCreated(created);
      // reset form
      setName('');
      setVisibility(initialVisibility);
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? 'Error creando la lista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <TextField
          label="Nombre de la lista"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
          required
        />

        <TextField
          select
          label="Visibilidad"
          size="small"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          fullWidth
        >
          <MenuItem value="PRIVATE">Privada</MenuItem>
          <MenuItem value="PUBLIC">Publica</MenuItem>
        </TextField>

        {/* Botones - fila separada, alineados a la derecha */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading} variant="outlined">
              Cancelar
            </Button>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
