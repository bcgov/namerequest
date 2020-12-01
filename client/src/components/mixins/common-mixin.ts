import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CommonMixin extends Vue {
  /** Returns the specified string in Title Case. */
  toTitleCase (str: any): string {
    return str && str
      .toLowerCase()
      .split(' ')
      .map(word => word.replace(word[0], word[0].toUpperCase()))
      .join(' ')
  }
}
