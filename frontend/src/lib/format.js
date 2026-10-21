const rupeeFormat = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export const rupees = (amount) => `Rs ${rupeeFormat.format(amount || 0)}`;

export const dayLabel = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const dateTime = (value) =>
    new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const ORDER_STATUSES = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];
