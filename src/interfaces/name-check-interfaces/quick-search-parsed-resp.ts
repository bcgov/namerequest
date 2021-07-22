import { ConflictListItemI } from './conflict-list-item'

export interface QuickSearchParsedRespI {
  exactNames: Array<ConflictListItemI>,
  synonymNames: Array<ConflictListItemI>,
  restrictedWords: Array<string>,
  conditionalWords: Array<string>,
  conditionalInstructions: Array<{ word: string, instructions: string }>
}
