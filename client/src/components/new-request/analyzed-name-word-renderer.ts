import { Vue } from 'vue-property-decorator'

const NameWordRenderer = Vue.component('word-markup', {
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
        let filteredActions = this.actions.filter(action => action.word_index === this.index)
        if (filteredActions.length === 0) {
          return div
        }
        let nonAddWordBracketActions = filteredActions.filter(action => action.type !== 'add_word_brackets')
        let addWordBracketActions = filteredActions.filter(action => action.type === 'add_word_brackets')
        if (nonAddWordBracketActions.length > 0) {
          let style = { ...this.style }
          for (let action of nonAddWordBracketActions) {
            switch (action.type) {
              case 'strike':
                style.color = 'red'
                style.textDecoration = style.textDecoration ? style.textDecoration + ' line-through' : 'line-through'
                break
              case 'highlight':
                style.color = 'red'
                break
              case 'spelling':
                style.textDecoration = style.textDecoration
                  ? style.textDecoration + ' underline wavy red' : 'underline wavy red'
                break
            }
          }
          div = [['div', { style }, this.word + '\xa0']]
        }
        if (addWordBracketActions.length > 0) {
          let style = { ...this.style }
          style.color = 'red'
          for (let action of addWordBracketActions) {
            let message = '[' + action.message + ']\xa0'
            let el = ['div', { style }, message]
            if (action.position === 'start') {
              div.unshift(el)
            } else {
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
