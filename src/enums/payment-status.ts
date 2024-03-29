/** Enum for Payment Status Code. */
export enum PaymentStatus {
  APPROVED = 'APPROVED',
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',

  PAID = 'PAID',
  DELETED = 'DELETED',
  UPDATE_REVENUE_ACCOUNT = 'GL_UPDATED',
  UPDATE_REVENUE_ACCOUNT_REFUND = 'GL_UPDATED_REFUND',
  DELETE_ACCEPTED = 'DELETE_ACCEPTED',
  SETTLEMENT_SCHEDULED = 'SETTLEMENT_SCHED',
  PARTIAL = 'PARTIAL_PAID',
  REFUNDED = 'REFUNDED',
  CREDITED = 'CREDITED'
}
