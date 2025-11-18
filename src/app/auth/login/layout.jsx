'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { GuestGuard } from 'src/auth/guard';

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
        }}
      >
        <Box
          component="a"
          href="/"
          aria-label="Al Carrito - Home"
          sx={{
            position: 'absolute',
            top: { xs: 12, md: 20 },
            left: { xs: 12, md: 20 },
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            zIndex: 1500,
          }}
        >
          <Box
            component="img"
            src="/logo/alcarrito.svg"
            alt="Al Carrito"
            sx={{
              width: { xs: 64, md: 88 },
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>

        <Paper
          elevation={1}
          sx={{
            width: '100%',
            maxWidth: 520, 
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {children}
        </Paper>
      </Box>
    </GuestGuard>
  );
}
