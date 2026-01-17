export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: '#FFD93D', icon: 'fa-clock' },
  confirmed: { label: 'Confirmed', color: '#4ECDC4', icon: 'fa-check' },
  preparing: { label: 'Preparing', color: '#FF6B35', icon: 'fa-fire' },
  ready: { label: 'Ready', color: '#6BCF7F', icon: 'fa-check-circle' },
  'out-for-delivery': { label: 'Out for Delivery', color: '#4ECDC4', icon: 'fa-truck' },
  delivered: { label: 'Delivered', color: '#6BCF7F', icon: 'fa-check-double' },
  cancelled: { label: 'Cancelled', color: '#EF476F', icon: 'fa-times-circle' },
};
