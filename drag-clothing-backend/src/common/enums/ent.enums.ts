export enum ProductStatus {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum PaymentGatewayStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum OtpPurpose {
  LOGIN = 'login',
  REGISTER = 'register',
  PASSWORD_RESET = 'password-reset',
}
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
