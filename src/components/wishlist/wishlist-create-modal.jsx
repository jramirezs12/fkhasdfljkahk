'use client';

import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { WishlistCreateForm } from './wishlist-create-form';


export function WishlistCreateModal({ open, onClose, onCreated }) {

  const handleCreated = (created) => {
    if (typeof onCreated === 'function') onCreated(created);
    if (!onCreated) {
      onClose?.();
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear nueva lista</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Crea una nueva lista donde podrás guardar productos. La visibilidad determina si otros usuarios pueden verla.
        </Typography>

        <WishlistCreateForm
          initialName=""
          initialVisibility="PUBLIC"
          onCreated={handleCreated}
          onCancel={onClose}
          submitLabel="Crear lista"
        />
      </DialogContent>
    </Dialog>
  );
}
