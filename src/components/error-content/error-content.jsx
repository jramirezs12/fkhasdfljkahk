'use client';

import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

export function ErrorContent({
  sx,
  slotProps,
  description = 'Lo sentimos, no pudimos encontrar la página que estás buscando.',
  title = 'Pagina no encontrada!',
  ...other
}) {
  return (
    <Container
      component={MotionContainer}
      sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <m.div variants={varBounce('in')}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <Typography sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <PageNotFoundIllustration sx={{ my: { xs: 5, sm: 10 } }} />
      </m.div>

      <Button component={RouterLink} href="/" size="medium" variant="contained">
        Ir al inicio
      </Button>
    </Container>
  );
}