const orderStatuses = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const cancellationReasons = {
  CHANGED_MIND: 'Changed my mind',
  WRONG_ITEM: 'Ordered wrong item',
  DELIVERY_TIME: 'Delivery time too long',
  FOUND_BETTER_PRICE: 'Found better price elsewhere',
  OTHER: 'Other reason'
};

// Time limits (in hours) for cancellation based on order status
const cancellationTimeLimit = {
  pending: 24, // Can cancel within 24 hours of ordering
  processing: 12, // Can cancel within 12 hours if still processing
  shipped: 0, // Cannot cancel once shipped
  delivered: 0, // Cannot cancel once delivered
  cancelled: 0 // Already cancelled
}; 