'use client';

import * as z from 'zod';
import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useIdTypes } from 'src/hooks/common/useIdTypes';
import { useCreateOtpRegister } from 'src/hooks/common/useCreateOtpRegister';

import { formatTime } from 'src/actions/common/time';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useRoles } from 'src/auth/hooks/register/useRoles';
import { useRegister } from 'src/auth/hooks/register/useRegister';

import { getErrorMessage } from '../../utils';
import { ICON_ROL } from '../resources/constants';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export const SignUpSchema = z.object({
    tipoId: z.string().min(1, { message: 'Tipo de identificación es obligatorio!' }),
    numeroId: z.preprocess(
        (val) => String(val ?? ''),
        z.string()
            .min(1, { message: 'Número de identificación es obligatorio!' })
            .max(10, { message: 'Número de identificación no debe exceder 10 digitos' })
            .regex(/^\d+$/, { message: 'Solo se permiten números' })
    ),
    razon: z.string().optional(),
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    correo: schemaUtils.email({
        error: {
            invalid: 'El correo electrónico no es válido',
            required: 'El correo electrónico es obligatorio!',
        }
    }),
    telefono: z.preprocess(
        (val) => String(val ?? ''),
        z.string()
            .length(10, { message: 'Debe ingresar un número de teléfono válido' })
            .regex(/^\d{10}$/, { message: 'Solo se permiten números, exactamente 10 dígitos' })
    ),
    contrasena: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmaContrasena: z.string().min(1, { message: 'Confirmar tu contraseña!' }),
    perfil: z.coerce.number({ invalid_type_error: 'Selecciona un perfil!' })
        .int({ message: 'Debe seleccionar uno de los perfiles.' })
        .min(1, { message: 'Selecciona un perfil!' }),
    aceptaTerminos: z.coerce.boolean().refine(val => val, {
        message: "Debes aceptar los términos y condiciones."
    }),
    autorizaDatos: z.coerce.boolean().refine(val => val, {
        message: "Debes autorizar el tratamiento de datos personales."
    }),
})
    .refine((data) => data.contrasena === data.confirmaContrasena, {
        message: "Las contraseñas no coinciden",
        path: ["confirmaContrasena"],
    })
    .refine((data) => {
        if (data.tipoId === '519') {
            return data.razon && data.razon.trim().length > 0;
        }
        return true;
    }, {
        message: 'Razón Social es obligatorio!',
        path: ['razon'],
    })
    .refine((data) => {
        if (data.tipoId !== '519') {
            return data.nombre && data.nombre.trim().length > 0;
        }
        return true;
    }, {
        message: 'Nombre es obligatorio!',
        path: ['nombre'],
    })
    .refine((data) => {
        if (data.tipoId !== '519') {
            return data.apellido && data.apellido.trim().length > 0;
        }
        return true;
    }, {
        message: 'Apellido es obligatorio!',
        path: ['apellido'],
    }
    );

export const OtpSchema = z.object({
    otp: z.preprocess(
        (val) => String(val ?? ''),
        z.string()
            .length(6, { message: 'Debe ingresar un código válido' })
            .regex(/^\d{6}$/, { message: 'Ingrese un código de 6 dígitos' })
    ),
});

// ----------------------------------------------------------------------

export default function RegisterView() {
    const verContrasena = useBoolean();
    const verConfirmacion = useBoolean();
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorRegMessage, setErrorRegMessage] = useState(null);
    const [openOtpDialog, setOpenOtpDialog] = useState(false);
    const [formData, setFormData] = useState(null);
    const [expiration, setExpiration] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [loadingOtp, setloadingOtp] = useState(false);
    const [loadingReg, setloadingReg] = useState(false);

    useEffect(() => {
        let interval;
        if (expiration !== null) {
            interval = setInterval(() => {
                const now = DateTime.now().setZone('America/Bogota').toMillis();
                const expireTime = DateTime.fromFormat(expiration, 'yyyy-MM-dd HH:mm:ss', { zone: 'America/Bogota' });
                const diff = Math.max(0, Math.floor((expireTime.ts - now) / 1000));
                setSecondsLeft(diff);
                if (diff === 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [expiration]);

    const { mutateAsync: createOtpAsync } = useCreateOtpRegister();
    const { mutateAsync: registerAsync } = useRegister();
    const { data: identificationTypes, isLoading: loadingTypes } = useIdTypes();
    const { data: roles, isLoading: loadingRoles } = useRoles();

    const defaultValues = {
        tipoId: '',
        numeroId: '',
        razon: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        contrasena: '',
        confirmaContrasena: '',
        perfil: '',
        aceptaTerminos: false,
        autorizaDatos: false,
    };
    const methods = useForm({
        resolver: zodResolver(SignUpSchema),
        defaultValues,
    });
    const {
        handleSubmit,
        formState: { isSubmitting },
        watch,
    } = methods;

    const defaultValuesOtp = { otp: '' };
    const methodOtp = useForm({
        resolver: zodResolver(OtpSchema),
        defaultValues: defaultValuesOtp,
    });
    const {
        handleSubmit: handleSubmitOtp,
    } = methodOtp;

    const onSubmit = handleSubmit(async (data) => {
        try {
            const response = await createOtpAsync({
                phone: data.telefono
            });
            if (response.success) {
                setExpiration(response.expiration);
                setFormData(data);
                setOpenOtpDialog(true);
            } else {
                setErrorMessage('Error al generar el código OTP. Por favor, intenta de nuevo.');
            }
        } catch (error) {
            const feedbackMessage = getErrorMessage(error);
            setErrorMessage(feedbackMessage);
        }
    });

    const onSubmitOtp = handleSubmitOtp(async (otpData) => {
        setloadingReg(true);
        try {
            await registerAsync({
                email: formData.correo,
                firstname: formData.tipoId === '519' ? formData.razon : formData.nombre,
                lastname: formData.tipoId === '519' ? formData.razon : formData.apellido,
                otpCode: otpData.otp,
                password: btoa(formData.contrasena),
                phoneNumber: formData.telefono,
                roleId: formData.perfil,
                //documentNumber: formData.numeroId,
                //typeIdentId: formData.tipoId,
            });
            // Clean vars, forms and close dialog
            setErrorMessage(null);
            setErrorRegMessage(null);
            setSecondsLeft(null);
            setExpiration(null);
            setFormData(null);
            methods.reset();
            methodOtp.reset();
            setOpenOtpDialog(false);
            toast.success('¡La cuenta se creó correctamente!');
            setloadingReg(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al crear la cuenta.');
            const feedbackMessage = getErrorMessage(error);
            setErrorRegMessage(feedbackMessage);
            setloadingReg(false);
        }
    });

    const handleResendCode = async () => {
        setloadingOtp(true);
        const response = await createOtpAsync({ phone: formData.telefono });
        if (response.success) {
            setExpiration(response.expiration);
        }
        setloadingOtp(false);
    };

    const renderForm = () => (
        <Box sx={{ mt: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>

            <Box
                sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
            >
                <Field.Select
                    name="tipoId"
                    label="Tipo Identificación"
                    slotProps={{ inputLabel: { shrink: true } }}
                    disabled={loadingTypes}
                >
                    <MenuItem value="">
                        <em>Seleccione</em>
                    </MenuItem>
                    {!loadingTypes &&
                        identificationTypes?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                </Field.Select>

                <Field.Text
                    name="numeroId"
                    label="Número Identificación"
                    type="number"
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            </Box>

            {watch('tipoId').length > 0 ?
                watch('tipoId') === '519' ? (
                    <Field.Text name="razon" label="Razón Social" slotProps={{ inputLabel: { shrink: true } }} />
                ) : (
                    <Box
                        sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
                    >
                        <Field.Text
                            name="nombre"
                            label="Nombre"
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Field.Text
                            name="apellido"
                            label="Apellido"
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>
                )
                : null
            }

            <Field.Text name="correo" label="Correo Electrónico" slotProps={{ inputLabel: { shrink: true } }} />

            <Field.Text fullWidth name="telefono" label="Teléfono" type="number" max="10" slotProps={{ inputLabel: { shrink: true } }} />

            <Box
                sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
            >
                <Field.Text
                    name="contrasena"
                    label="Contraseña"
                    type={verContrasena.value ? 'text' : 'password'}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={verContrasena.onToggle} edge="end">
                                        <Iconify icon={verContrasena.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Field.Text
                    name="confirmaContrasena"
                    label="Confirmar Contraseña"
                    type={verConfirmacion.value ? 'text' : 'password'}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={verConfirmacion.onToggle} edge="end">
                                        <Iconify icon={verConfirmacion.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Stack spacing={2}>
                <Typography variant="subtitle2">Elige tu perfil</Typography>
                {loadingRoles &&
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                        <CircularProgress />
                    </Box>
                }
                {!loadingRoles &&
                    <Controller
                        name="perfil"
                        render={({ field, fieldState }) => (
                            <>
                                <Box sx={{ gap: 2, display: 'grid', gridTemplateColumns: `repeat(${roles.length}, 1fr)` }}>
                                    {roles?.map((item) => (
                                        <Paper
                                            component={ButtonBase}
                                            variant="outlined"
                                            key={item.code}
                                            onClick={() => field.onChange(item.id)}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 1,
                                                typography: 'subtitle2',
                                                flexDirection: 'column',
                                                ...(item.id === field.value && {
                                                    borderWidth: 2,
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main',
                                                }),
                                            }}
                                        >
                                            {ICON_ROL[item.code] || ICON_ROL['default']}
                                            {item.label}
                                        </Paper>
                                    ))
                                    }
                                </Box>
                                {fieldState.error && (
                                    <Typography color="error" variant="caption">
                                        {fieldState.error.message}
                                    </Typography>
                                )}
                            </>
                        )}
                    />
                }
            </Stack>

            <Stack spacing={1}>
                <Field.Checkbox
                    name="aceptaTerminos"
                    label={
                        <Typography variant="caption" component="span">
                            Acepto los <Link href="https://www.alcarrito.com/terminos-y-condiciones-clientes-alcarrito-com" target="_blank" underline="hover">Términos y Condiciones</Link>
                        </Typography>
                    }
                />
                <Field.Checkbox
                    name="autorizaDatos"
                    label={
                        <Typography variant="caption" component="span">
                            Autorizo el tratamiento de mis datos personales para la finalidad descrita en la <Link href="https://interrapidisimo.com/proteccion-de-datos-personales/" target="_blank" underline="hover">Política de tratamiento de datos personales</Link> de Inter Rapidísimo.
                        </Typography>
                    }
                />
            </Stack>

            <Button
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Creando cuenta..."
            >
                Crear cuenta
            </Button>
        </Box>
    );

    return (
        <>
            <FormHead
                title="Completa tus datos"
                description="Proporciona tu información de usuario."
                sx={{ textAlign: { xs: 'center' } }}
            />

            <Form methods={methods} onSubmit={onSubmit}>
                {renderForm()}
            </Form>

            {!!errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Box sx={{ mt: 3, mb: 3 }}>
                <Divider>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        o
                    </Typography>
                </Divider>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    ¿Ya tienes una cuenta?
                </Typography>
                <Link component={RouterLink} href={paths.auth.login ?? '#'} underline="hover" sx={{ color: 'primary.main', typography: 'body2' }}>
                    Inicia sesión
                </Link>
            </Box>

            <Dialog
                fullWidth
                maxWidth="xs"
                open={openOtpDialog}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setOpenOtpDialog(false);
                    }
                }}
            >
                <DialogTitle>Verifica tu cuenta</DialogTitle>
                <Form methods={methodOtp} onSubmit={onSubmitOtp}>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }} >
                            Se ha enviado un código de verificación al número de teléfono: {formData !== null ? formData.telefono : ''}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ pt: 1, pb: 1 }}>
                            <Field.Text name="otp" type="text" label="Código" inputProps={{ maxLength: 6 }} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ flexGrow: 1, textAlign: 'center' }} >
                                {loadingOtp
                                    ? 'Enviando...'
                                    : secondsLeft !== null && (
                                        secondsLeft > 0
                                            ? `Reenviar código en: ${formatTime(secondsLeft)}`
                                            : (<Link
                                                component="button"
                                                onClick={handleResendCode}
                                                underline="hover"
                                                sx={{ color: 'primary.main' }}
                                            >
                                                Reenviar código
                                            </Link>
                                            )
                                    )
                                }
                            </Typography>
                        </Stack>

                        {!!errorRegMessage && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errorRegMessage}
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" color="inherit" onClick={() => setOpenOtpDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            color="inherit"
                            variant="contained"
                            loading={loadingReg}
                            loadingIndicator="Verificando.."
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
}
