import { EntityStates, EntityType } from '@/enums'

export interface BusinessRequest {
  filing: {
    header: {
      name: string
      accountId: number
    },
    business: {
      legalType: string
    },
    incorporationApplication?: {
      nameRequest: {
        legalType: string
        nrNumber?: string
      }
    },
    registration?: {
      business: {
        natureOfBusiness: string
      }
      nameRequest: {
        legalType: string
        nrNumber?: string
      }
    }
  }
}

export interface CreateNRAffiliationRequestBody {
  businessIdentifier: string
  phone?: string
  email?: string
}

export interface BusinessFetchIF {
  identifier: string
  legalName: string
  legalType: EntityType
  state: EntityStates
}
