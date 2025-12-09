import { CONFIG } from 'src/global-config';

export function adaptOrderList(data) {
    if (!data || !data.items) {
        console.warn("No se obtienen ordenes del backend:", data);
        return [];
    }

    return data.items.map((order, idx) => {
        const totalQuantity = order.items.reduce(
            (acc, item) => acc + item.quantity_ordered,
            0
        );

        return {
            id: (() => {
                try {
                    const decoded = atob(order.id);
                    const intId = parseInt(decoded.replace(/\D/g, ''), 10);
                    return isNaN(intId) ? order.id : intId;
                } catch {
                    return 0;
                }
            })(),
            orderNumber: order.order_number,
            createdAt: order.created_at,
            totalQuantity,
            subtotal: order.total.grand_total.value,
            status: order.status,
            customer: {
                name: `${order.shipping_address.firstname} ${order.shipping_address.lastname}`,
                email: order.email,
                avatarUrl: null,
            },
            items: order.items.map((i) => ({
                id: i.id,
                coverUrl: (i.product) ? i.product.thumbnail.url : CONFIG.assetsDir + '/assets/images/img-not-found.jpg',
                name: i.product_name,
                sku: i.product_sku,
                quantity: i.quantity_ordered,
                price: i.product_sale_price.value,
            })),
        };
    });
}
