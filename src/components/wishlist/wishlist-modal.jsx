'use client';

import useSWR from 'swr';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import {
  fetchWishlists,
  addProductsToWishlists,
} from 'src/actions/wishlist/wishlist';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';

import { WishlistCreateModal } from './wishlist-create-modal';


export function WishlistModal({ open, onClose, product }) {
  const { authenticated } = useAuthContext();

  const { data: lists = [], mutate: mutateLists, isValidating } = useSWR(
    'wishlists',
    fetchWishlists,
    { revalidateOnFocus: false }
  );

  const [selectedListIds, setSelectedListIds] = useState([]);
  const [adding, setAdding] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);


  useEffect(() => {
    if (!open) return;
    if (Array.isArray(lists) && lists.length > 0 && selectedListIds.length === 0) {
      setSelectedListIds([lists[0].id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists, open]);

  useEffect(() => {
    if (open) return;
    setSelectedListIds([]);
    setAdding(false);
  }, [open]);

  const toggleSelect = (id) => {
    setSelectedListIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAddToWishlist = async () => {
    if (!authenticated) {
      toast.error('Debes iniciar sesión para usar las listas');
      return;
    }
    if (!product?.sku) {
      toast.error('Producto inválido');
      return;
    }
    if (!Array.isArray(selectedListIds) || selectedListIds.length === 0) {
      toast.error('Selecciona al menos una lista');
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await addProductsToWishlists({
        wishlistIds: selectedListIds,
        items: [{ sku: product.sku, quantity: 1 }],
      });
      toast.success(`Producto agregado a ${selectedListIds.length} lista(s)`);
      await mutateLists();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? 'Error agregando a la(s) lista(s)');
    } finally {
      setAdding(false);
    }
  };

  const handleCreated = (created) => {
    // add created.id to selection if available
    if (created?.id) {
      setSelectedListIds((prev) => Array.from(new Set([...(prev || []), created.id])));
      // ensure lists are refreshed
      mutateLists();
    }
  };

  return (
    <>
      <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar a favoritos</DialogTitle>

        <DialogContent dividers>
          {!authenticated ? (
            <Box sx={{ py: 2 }}>
              <Typography color="text.secondary">
                Debes iniciar sesión para administrar tus listas y agregar productos.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Selecciona una o más listas</Typography>

                  {/* Botón que abre modal de creación separado */}
                  <Button size="small" variant="outlined" onClick={() => setOpenCreateModal(true)}>
                    Crear lista
                  </Button>
                </Stack>

                {isValidating && lists.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List dense>
                    {lists.length === 0 ? (
                      <ListItem>
                        <Typography variant="caption" color="text.secondary">
                          No tienes listas aún. Crea una nueva con el botón Crear lista.
                        </Typography>
                      </ListItem>
                    ) : (
                      lists.map((l) => (
                        <ListItem
                          key={l.id}
                          button
                          onClick={() => toggleSelect(l.id)}
                          divider
                          secondaryAction={<Typography variant="caption">{l.items_count ?? 0}</Typography>}
                        >
                          <Checkbox
                            edge="start"
                            checked={selectedListIds.includes(l.id)}
                            tabIndex={-1}
                            disableRipple
                            onChange={() => toggleSelect(l.id)}
                            inputProps={{ 'aria-labelledby': `wishlist-${l.id}` }}
                          />
                          <ListItemText id={`wishlist-${l.id}`} primary={l.name} secondary={`Visibility: ${l.visibility ?? 'PRIVATE'}`} />
                        </ListItem>
                      ))
                    )}
                  </List>
                )}
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">
                Selecciona una o más listas y pulsa Agregar a favoritos para añadir este producto.
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={adding}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleAddToWishlist} disabled={!authenticated || adding}>
            {adding ? <CircularProgress size={18} color="inherit" /> : 'Agregar a favoritos'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal separado para crear lista */}
      <WishlistCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreated={handleCreated} />
    </>
  );
}
