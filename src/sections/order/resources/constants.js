'use client';

export const STATUS_COLORS = {
  'Pago por confirmar': 'warning',
  'Orden en Proceso': 'warning',
  'Orden Confirmada': 'success',
  'Entregado': 'success',
  'Completo': 'success',
  'Cancelado': 'error',
  'Devuelto': 'error',
};

export const TABLE_ORDER_HEAD = [
  { id: 'orderNumber', label: 'Orden', width: 88 },
  { id: 'name', label: 'Cliente' },
  { id: 'createdAt', label: 'Fecha', width: 140 },
  { id: 'totalQuantity', label: 'Cantidad', width: 88, align: 'center' },
  { id: 'totalAmount', label: 'Total', width: 140 },
  { id: 'status', label: 'Estado', width: 110 },
  { id: '', width: 40 },
];
