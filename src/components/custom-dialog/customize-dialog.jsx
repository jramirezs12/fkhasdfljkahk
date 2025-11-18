import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CustomizedDialog({ title, message, open, handleClose, isError }) {
  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle
        sx={(theme) => ({
          m: 0,
          p: 2,
          color: isError
            ? theme.palette.error.main
            : theme.palette.success.main,
        })}
        id="customized-dialog-title"
      >
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
      </IconButton>
      <DialogContent dividers>
        <Typography gutterBottom>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          sx={(theme) => ({
            color: theme.vars?.palette?.primary?.main || theme.palette.primary.main || "primary",
          })}
          autoFocus
          onClick={handleClose}
        >
          Cerrar
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}