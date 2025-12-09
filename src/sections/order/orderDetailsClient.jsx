"use client";

import { useGetOrder } from 'src/hooks/order/useGetOrder';

import { HomeContent } from 'src/layouts/home';
import { adaptOrder } from "src/actions/order/adapters/orderAdapter";

import { ErrorContent } from 'src/components/error-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { PermissionContent } from 'src/components/permission-content';

import { OrderDetailsView } from 'src/sections/order/view';

export default function OrderDetailsClient({ id }) {
    const { data, error, isLoading } = useGetOrder(id);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        console.error('Error al cargar detalle orden:', error);
        return (
            <HomeContent>
                <ErrorContent
                    title="Orden no disponible"
                    description="Lo sentimos, no pudimos cargar la orden en este momento. Por favor, intenta nuevamente más tarde."
                    sx={{ mt: 10 }}
                />
            </HomeContent>
        );
    }

    if (!data.items || data.items.length === 0) {
        return (
            <HomeContent>
                <PermissionContent
                    title="Acceso denegado"
                    description={`No tienes permiso para ver la orden: ${id}`}
                    sx={{ mt: 10 }}
                />
            </HomeContent>
        );
    }

    const order = adaptOrder(data);
    console.log('Adapted order details:', order);
    return <OrderDetailsView order={order} />;
}
