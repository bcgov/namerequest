import removeAccents from 'remove-accents'

export function removeExcessSpaces (name: string): string {
  name = name.replace(/\s\s+/g, ' ')
  return name.trim()
}

export function sanitizeName (name: string): string {
  name = removeAccents(name)
  name = removeExcessSpaces(name)
  name = name.replace(/[^\sa-zA-Z0-9*/+&().,="'#@!?;:-]/g, '')
  return name.toUpperCase()
}

export function matchWord (name: string, word: string) {
  name = name.toUpperCase()
  word = word.toUpperCase().replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  return name.match(new RegExp('(?<=(^|\\s))' + word + '(?=(\\s|$))', 'g'))
}

export function replaceWord (name: string, word: string, substitution: string | null = null) {
  name = name.toUpperCase()
  word = word.toUpperCase().replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  if (substitution) {
    substitution = substitution.toUpperCase()
    return removeExcessSpaces(name.replace(new RegExp('(?<=(^|\\s))' + word + '(?=(\\s|$))'), substitution))
  }
  return removeExcessSpaces(name.replace(new RegExp('(?<=(^|\\s))' + word + '(?=(\\s|$))', 'g'), ''))
}
