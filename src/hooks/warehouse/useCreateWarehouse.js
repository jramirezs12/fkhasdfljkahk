import { useMutation } from '@tanstack/react-query';

import { createWarehouse } from 'src/sections/warehouse/context/warehouse/action';

export function useCreateWarehouse() {
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: (warehouse) => {
      //toast.success(`✅ Bodega "${warehouse.name}" creada exitosamente`);
    },
    onError: (error) => {
      //toast.error(`❌ Error al crear la bodega: ${error.message}`);
    },
  });
}