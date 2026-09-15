declare module '@paystack/inline-js' {
  export interface PaystackTransactionSuccess {
    id: number
    reference: string
    message: string
  }

  export interface PaystackTransactionError {
    message: string
  }

  export interface PaystackTransactionLoad {
    id: number
    customer: Record<string, unknown>
    accessCode: string
  }

  export interface PaystackTransactionCallbacks {
    onSuccess?: (transaction: PaystackTransactionSuccess) => void
    onCancel?: () => void
    onLoad?: (transaction: PaystackTransactionLoad) => void
    onError?: (error: PaystackTransactionError) => void
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: PaystackTransactionCallbacks): unknown
  }
}
