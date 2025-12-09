'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';

import { isAuthError, handleAuthError } from 'src/lib/authErrors';

/**
 * ClientErrorBoundary (componente cliente)
 * - Detecta errores de autorización y abre modal de sesión expirada
 * - Para otros errores muestra fallback compacto con botón de recarga
 */
export class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isAuth: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, info) {
    try {
      if (isAuthError(error)) {
        try {
          await handleAuthError(error);
        } catch (e) {
          // ignore
          console.warn('handleAuthError failed', e);
        }
        this.setState({ isAuth: true });
        return;
      }
    } catch {
      // ignore detection errors
    }

    // logging for other errors (Sentry integration point)
    console.error('ClientErrorBoundary caught:', error, info);
  }

  render() {
    const { hasError, error, isAuth } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    // If auth error, modal already opened — suppress dump
    if (isAuth) return null;

    if (fallback) return typeof fallback === 'function' ? fallback({ error }) : fallback;

    // Default compact fallback UI
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 1 }}>
          Ocurrió un error en esta sección.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {String(error?.message || 'Error desconocido')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            try {
              if (typeof window !== 'undefined') window.location.reload();
            } catch {
              // noop
            }
          }}
        >
          Recargar
        </Button>
      </Box>
    );
  }
}

export default ClientErrorBoundary;
