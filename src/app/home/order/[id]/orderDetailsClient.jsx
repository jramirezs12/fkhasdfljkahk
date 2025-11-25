"use client";

import { useGetOrder } from 'src/hooks/order/getOrder';

import { adaptOrder } from "src/actions/order/adapters/orderAdapter";

import { LoadingScreen } from 'src/components/loading-screen';

import { OrderDetailsView } from 'src/sections/order/view';

export default function OrderDetailsClient({ id }) {
    const { data, error, isLoading } = useGetOrder(id);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        console.error('Error al cargar detalle orden:', error);
        return <OrderDetailsView order={[]} error={error} />;
    }
    console.log('Data order details:', data);
    const order = adaptOrder(data);
    console.log('Adapted order details:', order);
    return <OrderDetailsView order={order} />;
}
