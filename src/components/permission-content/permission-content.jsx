'use client';

import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

export function PermissionContent({
    sx,
    slotProps,
    description = 'No tienes permiso para acceder a esta página.',
    title = 'Permiso denegado',
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
                <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
            </m.div>
        </Container>
    );
}