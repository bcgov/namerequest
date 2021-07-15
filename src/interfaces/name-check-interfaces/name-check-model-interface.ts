import { NameCheckErrorI } from './name-check-error'

export interface NameCheckModelIF {
    analyzeConflictsPending: boolean
    analyzeDesignationPending: boolean
    analyzeStructurePending: boolean
    conflictsExact: Array<string>
    conflictsConditional: Array<string>
    conflictsRestricted: Array<string>
    conflictsSimilar: Array<string>
    designation: string
    designationsCheckUse: Array<string>
    designationsMismatched: Array<string>
    designationsMisplaced: Array<string>
    doNameCheck: boolean
    errors: NameCheckErrorI
    fullName: string
    missingDescriptive: boolean
    missingDesignation: boolean
    missingDistinctive: boolean
    specialCharacters: Array<string>
}
