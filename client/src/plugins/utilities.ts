import removeAccents from 'remove-accents'

export function removeExcessSpaces (name) {
  return name.replace(/\s\s+/g, ' ')
}

export function sanitizeName (name) {
  name = removeAccents(name)
  name = removeExcessSpaces(name)
  name = name.replace(/[^\sa-zA-Z0-9*/+&().,="'#@!?;:-]/g, '')
  return name.toUpperCase()
}
