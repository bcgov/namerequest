export interface NameRequest {
  legalType: string,
  nrNumber?: string
}

export interface BusinessRequest {
  filing: {
    header: {
      name: string,
      accountId: number
    },
    business: {
      legalType: string
    },
    incorporationApplication?: {
      nameRequest: NameRequest
    },
    registration?: {
      nameRequest: NameRequest
    }
  }
}

export interface CreateNRAffiliationRequestBody {
  businessIdentifier: string
  phone?: string
  email?: string
}
