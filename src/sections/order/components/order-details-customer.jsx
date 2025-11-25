import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';


// ----------------------------------------------------------------------

export function OrderDetailsCustomer({ customer }) {
  return (
    <>
      <CardHeader
        title="Cliente"
      />
      <Box sx={{ p: 3, display: 'flex' }}>
        <Avatar
          alt={customer?.name}
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            color: 'white',
            fontSize: 20,
            mr: 2
          }}
        >
          {customer.name
            ? customer.name
              .split(' ')
              .filter(Boolean)
              .map(word => word[0].toUpperCase())
              .join('')
            : '?'}
        </Avatar>

        <Stack spacing={0.5} sx={{ typography: 'body2', alignItems: 'flex-start' }}>
          <Typography variant="subtitle2">{customer?.name}</Typography>
          <Box sx={{ color: 'text.secondary' }}>{customer?.email}</Box>
        </Stack>
      </Box>
    </>
  );
}
