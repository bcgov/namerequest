export function normalizeWordCase (name: string) {
  name = name.replace(/\s\s+/g, ' ')
  name.toLowerCase()
  let nameArray = name.split(' ')
  for (let n = 0; n < nameArray.length; n++) {
    nameArray[n] = nameArray[n][0].toUpperCase() + nameArray[n].slice(1)
  }
  return nameArray.join(' ')
}
