export interface ParsedRestrictedResponseIF {
  conditionalInstructions: Array<{ word: string, instructions: string }>
  conditionalWords: Array<string>
  restrictedWords: Array<string>
}
