import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCreateWarehouse } from 'src/hooks/warehouse/useCreateWarehouse';

import { useGetCities } from 'src/actions/order/order';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SCHEDULE_OPTIONS = [
    { label: 'Mañana', range: '08:00 - 12:00', value: 'morning', icon: 'mdi:weather-sunny' },
    { label: 'Tarde', range: '12:00 - 18:00', value: 'afternoon', icon: 'mdi:weather-sunset' },
    { label: 'Noche', range: '18:00 - 22:00', value: 'night', icon: 'mdi:weather-night' },
];

export const WarehouseSchema = z.object({
    name: z.string().min(1, { message: 'El nombre es obligatorio' }),
    address: z.string().min(1, { message: 'La dirección es obligatoria' }),
    city: z.string().min(1, { message: 'La ciudad es obligatoria' }),
    contact_name: z.string().min(1, { message: 'El nombre del contacto es obligatorio' }),
    contact_email: z.string().email({ message: 'Debe ser un correo válido' }),
    contact_phone: z.string()
        .length(10, { message: 'Debe ingresar un número de teléfono válido' })
        .regex(/^\d{10}$/, { message: 'Solo se permiten números, exactamente 10 dígitos' }),
    is_active: z.boolean().default(true),
    dispatch_days: z.array(z.string()).nonempty({ message: 'Seleccione al menos un día' }),
    dispatch_schedules: z.string().min(1, { message: 'Seleccione un horario' }),
});

export function WarehouseCreateForm({ onClose, onSubmit }) {

    const { mutateAsync } = useCreateWarehouse();

    const defaultValues = {
        name: '',
        address: '',
        city: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
        dispatch_days: [],
        dispatch_schedules: '',
    };

    const methods = useForm({
        resolver: zodResolver(WarehouseSchema),
        defaultValues,
    });

    const {
        reset,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const submitForm = handleSubmit(async (data) => {
        try {
            await mutateAsync({
                address: data.address,
                name: data.name,
                city: data.city,
                contact_email: data.contact_email,
                contact_name: data.contact_name,
                contact_phone: data.contact_phone,
            });
            reset();
            toast.success('¡La sucursal se creó correctamente!');
            onSubmit();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear la sucursal. Inténtalo nuevamente.');
        }
    });

    const { citiesOptions, citiesLoading } = useGetCities();

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "30% 70%" },
                height: 1,
            }}
        >
            <Box
                sx={{
                    backgroundImage: 'url(/assets/background/background-4.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: 1,
                    overflow: "hidden",
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                }}
            >

                <Box
                    sx={{
                        p: 3,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        position: "sticky",
                        top: 0,
                        backgroundColor: "background.paper",
                        zIndex: 2,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Creación de sucursal
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 5,
                        backgroundColor: "background.default",
                    }}
                >
                    <Form id="warehouseForm" methods={methods} onSubmit={submitForm}>
                        <Stack spacing={2}>
                            <Field.Text fullWidth name="name" label="Nombre de sucursal" placeholder="Ej: Sucursal Centro" />
                            <Field.Text fullWidth name="contact_name" label="Nombre del contacto" placeholder="Ej: Juan Pérez" />
                            <Field.Text fullWidth name="contact_email" label="Email" placeholder="Ej: contacto@empresa.com" />
                            <Field.Text fullWidth name="contact_phone" label="Teléfono" placeholder="Ej: 3216549870" max="10" />
                            <Field.Select
                                name="city"
                                label="Ciudad"
                                slotProps={{ inputLabel: { shrink: true } }}
                                disabled={citiesLoading}
                            >
                                <MenuItem value="">
                                    <em>Seleccione</em>
                                </MenuItem>
                                {!citiesLoading &&
                                    citiesOptions?.map((option) => (
                                        <MenuItem key={option.value} value={option.label}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                            </Field.Select>
                            <Field.Text fullWidth name="address" label="Dirección" placeholder="Ej: Calle 123 #45-67" />
                            <Controller
                                name="dispatch_days"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <FormControl fullWidth error={!!fieldState.error}>
                                        <InputLabel>Días de despacho</InputLabel>
                                        <Select
                                            multiple
                                            {...field}
                                            input={<OutlinedInput label="Días de despacho" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value} />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {DAYS_OF_WEEK.map((day) => (
                                                <MenuItem key={day} value={day}>
                                                    <Checkbox checked={field.value.includes(day)} />
                                                    {day}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="dispatch_schedules"
                                control={control}
                                render={({ field, fieldState }) => {
                                    const current = field.value || '';
                                    return (
                                        <FormControl component="fieldset" fullWidth error={!!fieldState.error}>
                                            <FormLabel component="legend">Horario de despacho</FormLabel>

                                            <FormGroup row sx={{ mt: 1 }}>
                                                {SCHEDULE_OPTIONS.map((option) => {
                                                    const checked = current === option.value;
                                                    const select = () => field.onChange(option.value);
                                                    return (
                                                        <Box
                                                            key={option.value}
                                                            onClick={select}
                                                            sx={(theme) => ({
                                                                mr: 2,
                                                                px: 1.25,
                                                                py: 1,
                                                                borderRadius: 1.5,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                flexDirection: 'column',
                                                                cursor: 'pointer',
                                                                border: `1px solid ${checked
                                                                    ? theme.palette.primary.main
                                                                    : theme.vars?.palette?.divider || theme.palette.divider
                                                                    }`,
                                                                bgcolor: checked
                                                                    ? (theme.vars
                                                                        ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`
                                                                        : 'action.hover')
                                                                    : 'background.paper',
                                                                transition: 'all 0.15s ease-in-out',
                                                            })}
                                                        >
                                                            <Radio
                                                                checked={checked}
                                                                onChange={select}
                                                                value={option.value}
                                                                icon={<Iconify icon={option.icon} width={28} color="text.disabled" />}
                                                                checkedIcon={<Iconify icon={option.icon} width={28} color="primary.main" />}
                                                                sx={{ p: 0.25 }}
                                                            />
                                                            <Typography variant="caption" sx={{ mt: 0.75 }}>
                                                                {option.range}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </FormGroup>

                                            {fieldState.error && (
                                                <FormHelperText sx={{ mt: 1 }}>{fieldState.error.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    );
                                }}
                            />
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        sx={{ ml: 1 }}
                                        control={<Switch {...field} checked={field.value} color="primary" />}
                                        label={
                                            'Activación de sucursal (Sucursal ' +
                                            (field.value ? 'habilitada' : 'inhabilitada') +
                                            ')'
                                        }
                                    />
                                )}
                            />
                        </Stack>
                    </Form>
                </Box>

                <Box
                    sx={{
                        p: 3,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "background.paper",
                        zIndex: 2,
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={methods.handleSubmit(submitForm)}
                            variant="contained"
                            loading={isSubmitting}
                            loadingIndicator='Creando sucursal...'
                        >
                            Crear sucursal
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}