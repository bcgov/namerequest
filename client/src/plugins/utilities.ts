export function normalizeWordCase (name: string) {
  name = name.replace(/\s\s+/g, ' ')
  name = name.toLowerCase()
  let nameArray = name.split(' ')
  // eslint-disable-next-line
  console.log(nameArray)
  if (nameArray.length <= 1) {
    let first = name[0].toUpperCase()
    let length = name.length
    let rest = name.slice(1, length)
    return first + rest
  }
  for (let n = 0; n < nameArray.length; n++) {
    if (nameArray[n] && nameArray[n][0]) {
      nameArray[n] = nameArray[n][0].toUpperCase() + nameArray[n].slice(1)
    }
  }
  return nameArray.join(' ')
}
