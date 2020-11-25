import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CommonMixin extends Vue {
  toTitleCase (str: any): string {
    return str && str
      .toLowerCase()
      .split(' ')
      .map(word => word.replace(word[0], word[0].toUpperCase()))
      .join(' ')
  }
}
