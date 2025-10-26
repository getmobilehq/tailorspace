// User Roles
export const ROLES = {
  CUSTOMER: 'customer',
  TAILOR: 'tailor',
  RUNNER: 'runner',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  IN_TAILORING: 'in_tailoring',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
} as const;

// Support Session Status
export const SUPPORT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
export type SupportStatus = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS];
