import { EntityStates, EntityTypes } from '@/enums'
import { AmalgamationTypes } from '@bcrs-shared-components/enums'

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
    amalgamation?: {
      nameRequest: {
        legalType: string
        nrNumber?: string
      },
      type: AmalgamationTypes
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

/** Result object from business fetch/lookup. */
export interface BusinessSearchIF {
  identifier: string
  legalName: string
  legalType: EntityTypes
  state: EntityStates
}
