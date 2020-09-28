import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { ApplicantI } from '@/models'

import newRequestModule, { NewRequestModule } from '@/store/new-request-module'
import * as filingTypes from "@/modules/payment/filing-types"

@Component
export default class NameRequestMixin extends Vue {
  get nr () {
    const nameRequest: NewRequestModule = newRequestModule
    const nr: Partial<any> = nameRequest.nr || {}
    return nr
  }

  get nrId () {
    return newRequestModule.nrId
  }

  get nrNum () {
    return newRequestModule.nrNum
  }

  get nrData () {
    const nameRequest: NewRequestModule = newRequestModule
    const nrData: Partial<any> = nameRequest.nrData || {}
    return nrData
  }

  get applicant (): Partial<ApplicantI> | undefined {
    const nameRequest: NewRequestModule = newRequestModule
    const applicantInfo: Partial<ApplicantI> = nameRequest.applicant || undefined
    return applicantInfo
  }

  get isPersonsName () {
    const nameRequest: NewRequestModule = newRequestModule
    const isPersonsName: boolean = nameRequest.isPersonsName
    return isPersonsName
  }

  get name () {
    const nameRequest: NewRequestModule = newRequestModule
    const name: string = nameRequest.name
    return name
  }

  /**
   * eg:
   * {
   *     name1: 'ACME Construction',
   *     name2: 'ACME Home Construction',
   *     name3: 'ACME Commercial Construction',
   *     designation1: 'Ltd.',
   *     designation2: 'Ltd.',
   *     designation3: 'Ltd.'
   * }
   */
  get nameChoices () {
    const nameRequest: NewRequestModule = newRequestModule
    const nameRequestChoices: {} = nameRequest.nameChoices || {}

    /** Test
     {
        name1: 'ACME Construction',
        name2: 'ACME Home Construction',
        name3: 'ACME Commercial Construction',
        designation1: 'Ltd.',
        designation2: 'Ltd.',
        designation3: 'Ltd.'
     }
     */
    const parseNameChoices = (nameChoices) => {
      return Object.keys(nameChoices)
        .reduce((names, key, idx) => {
          // Key will be either 'name' or 'designation'
          const nameIdx = key.match(/[\d]+$/)[0]
          const typeKey = key.substring(0, key.lastIndexOf(nameIdx))
          names[nameIdx] = names[nameIdx] || { name: undefined, designation: undefined }
          names[nameIdx][typeKey] = nameChoices[key]
          return names
        }, [])
        .map((choice) => {
          // Make sure to replace designation if it's part of the name
          return (choice.name && choice.designation)
            ? `${choice.name.replace(choice.designation, '')} ${choice.designation}`
            : (choice.name && !choice.designation)
              ? `${choice.name}`
              : undefined
        })
        .filter((name) => !!name)
    }

    return parseNameChoices(nameRequestChoices)
  }

  get priorityRequest () {
    const nameRequest: NewRequestModule = newRequestModule
    const priorityRequest: boolean = nameRequest.priorityRequest
    return priorityRequest
  }

  get filingType () {
    const { priorityRequest } = this
    let filingType = filingTypes.NM620
    if (priorityRequest) {
      // TODO: NM521 isn't working for calculating fees...
      filingType = filingTypes.NM620
    }

    return filingType
  }

  // TODO: Where is this used?
  get entityType () {
    const nameRequest: NewRequestModule = newRequestModule
    const entity_type_cd: string = nameRequest.entity_type_cd
    return entity_type_cd
  }
}
