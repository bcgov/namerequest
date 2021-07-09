export interface RestrictedResponseIF {
  restricted_words_conditions: Array<{
    cnd_info: Array<{
      allow_use: string,
      consent_rrequired: string,
      id: number,
      instructions: string,
      text: string
    }>,
    word_info: {
      id: number,
      phrase: string
    }
  }>
}