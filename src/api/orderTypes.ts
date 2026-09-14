export type FulfillmentType = 'pickup' | 'customer_rider' | 'sour_lemon_delivery'
export type PaymentMethod = 'card' | 'momo' | 'cash'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cash_due' | 'cash_collected' | 'refunded'
export type OrderStatus =
  | 'received'
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export type CustomerOrderScope = 'active' | 'history'

export interface DeliveryAddressInput {
  recipientName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  landmark?: string
}

export interface DeliveryAddressSnapshot extends DeliveryAddressInput {
  deliveryAreaName?: string
}

export interface OrderPaymentSummary {
  id: string
  provider: 'paystack' | 'cash'
  method: PaymentMethod
  status: PaymentStatus
  displayStatus: 'waiting_for_payment' | 'needs_review' | 'confirmed' | 'cash_due' | 'cash_collected' | 'failed' | 'refunded'
  amount: string
  accessCode: string | null
}

export interface OrderItemSummary {
  id: string
  productId: string | null
  productName: string
  productDescription: string | null
  productImageUrl: string | null
  quantity: number
  unitPrice: string
  lineTotal: string
}

export interface OrderReceipt {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentType: FulfillmentType
  customerName: string
  customerEmail: string | null
  phoneNumber: string
  whatsappNumber: string | null
  deliveryAddress: DeliveryAddressSnapshot | null
  subtotal: string
  deliveryFee: string
  total: string
  currency: string
  customerNotes: string | null
  placedAt: string
  confirmedAt: string | null
  items: OrderItemSummary[]
  payment: OrderPaymentSummary | null
  whatsappLink: string | null
}

export interface CustomerOrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentDisplayStatus: OrderPaymentSummary['displayStatus']
  fulfillmentType: FulfillmentType
  total: string
  currency: string
  placedAt: string | null
  createdAt: string
  itemCount: number
  itemPreview: Array<{
    id: string
    productName: string
    productImageUrl: string | null
    quantity: number
  }>
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
