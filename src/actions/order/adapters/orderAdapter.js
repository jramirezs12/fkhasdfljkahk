export function adaptOrder(data) {
    if (!data || !data.items) {
        console.warn("No encuentra información de la orden:", data);
        return [];
    }
    const order = data.items[0];

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
        taxes: order.total.taxes.reduce((acc, tax) => acc + tax.amount.value, 0),
        items: order.items.map((prod) => ({
            id: (() => {
                try {
                    const decoded = atob(prod.id);
                    const intId = parseInt(decoded.replace(/\D/g, ''), 10);
                    return isNaN(intId) ? prod.id : intId;
                } catch {
                    return 0;
                }
            })(),
            coverUrl: prod.product.thumbnail.url,
            name: prod.product_name,
            sku: prod.product_sku,
            quantity: prod.quantity_ordered,
            price: prod.product_sale_price.value,
        })),
        history: [],
        subtotal: order.total.subtotal.value,
        shipping: order.total.total_shipping.value,
        discount: order.total.discounts.reduce((acc, discount) => acc + discount.amount.value, 0),
        customer: {
            name: `${order.shipping_address.firstname} ${order.shipping_address.lastname}`,
            email: order.email,
        },
        delivery: {
            shipBy: order.shipments[0]?.tracking[0]?.title || '',
            trackingNumber: order.shipments[0]?.tracking[0]?.number || '',
            carrier: order.shipments[0]?.tracking[0]?.carrier || '',
        },
        totalAmount: order.total.grand_total.value,
        totalQuantity: order.items.reduce((acc, prod) => acc + prod.quantity_ordered, 0),
        shippingAddress: {
          fullAddress: `${order.shipping_address.street[0]} ${order.shipping_address.street[1] || ''} - ${order.shipping_address.city}, ${order.shipping_address.region}`,
          phoneNumber: order.shipping_address.telephone,
        },
        payment: { cardType: 'mastercard', cardNumber: '**** **** **** 5678' },
        status: order.status,
    };
}