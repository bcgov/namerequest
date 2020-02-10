import { Vue } from 'vue-property-decorator'

const NameWordRenderer = Vue.component('name-word-renderer', {
  props: ['word', 'actions', 'index'],
  data () {
    return {
      style: {
        display: 'inline'
      }
    }
  },
  computed: {
    output: function () {
      let div = [['div', { style: this.style }, this.word + '\xa0']]
      if (Array.isArray(this.actions)) {
        let filteredActions = this.actions.filter(action => action.index === this.index)
        if (filteredActions.length === 0) {
          return div
        }
        let nonBracketsActions = filteredActions.filter(action => action.type !== 'brackets')
        let BracketsActions = filteredActions.filter(action => action.type === 'brackets')
        if (nonBracketsActions.length > 0) {
          let style = { ...this.style }
          for (let action of nonBracketsActions) {
            switch (action.type) {
              case 'strike':
                style.color = '#d3272c'
                style.textDecoration = style.textDecoration ? style.textDecoration + ' line-through' : 'line-through'
                break
              case 'highlight':
                style.color = '#d3272c'
                break
              case 'spelling':
                style.textDecoration = style.textDecoration
                  ? style.textDecoration + ' underline wavy #d3272c' : 'underline wavy #d3272c'
                break
            }
          }
          div = [['div', { style }, this.word + '\xa0']]
        }
        if (BracketsActions.length > 0) {
          let style = { ...this.style }
          style.color = '#d3272c'
          for (let action of BracketsActions) {
            let message = '[' + action.message + ']\xa0'
            let el = ['div', { style }, message]
            if (action.position === 'start') {
              div.unshift(el)
            }
            if (action.position === 'end') {
              div.push(el)
            }
          }
        }
      }
      return div
    }
  },
  render (createEl) {
    let childArray = []
    this.output.forEach(el => {
      childArray.push(createEl(...el))
    })
    let style = {
      display: 'inline'
    }
    return createEl(
      'div', { style }, childArray
    )
  }
})

export default NameWordRenderer
