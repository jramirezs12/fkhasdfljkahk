import { paths } from 'src/routes/paths';

export function adaptNotificationOrder(data) {
    if (!data || !data.items) {
        return [];
    }

    return data.items
        .filter(order => Array.isArray(order.order_track_number) ? order.order_track_number.length === 0 : !order.order_track_number || order.order_track_number.length === 0)
        .map((order) => ({
            id: 'orden' + atob(order.id),
            avatarUrl: null,
            type: 'order',
            category: 'Order',
            isUnRead: true,
            createdAt: order.created_at,
            title: `<p>Su orden <strong><a href='${paths.home.order.details(atob(order.id))}'>#${order.order_number}</a></strong> está pendiente de generar guia.</p>`
        }));
}