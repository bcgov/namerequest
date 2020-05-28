import { Vue } from 'vue-property-decorator'

const NameWordRenderer = Vue.component('name-word-renderer', {
  props: ['word', 'actions', 'index', 'name'],
  data () {
    return {
      lastIndexStyle: {
        display: 'inline',
        paddingRight: '0',
        paddingLeft: '0',
        marginRight: '4px',
        marginLeft: '0'
      },
      style: {
        display: 'inline',
        paddingRight: '0',
        paddingLeft: '0',
        marginRight: '0',
        marginLeft: '0'
      }
    }
  },
  computed: {
    lastIndex () {
      return this.letters.length - 1
    },
    letters () {
      return Array.from(this.word)
    },
    output () {
      let filteredActions = this.actions.filter(action => action.index === this.index)
      let style = { ...this.style }
      if (filteredActions.some(action => action.type === 'strike')) {
        style.textDecoration = 'line-through'
        style.color = '#d3272c'
      }
      if (filteredActions.some(action => action.type === 'highlight')) {
        style.color = '#d3272c'
      }
      let elements = this.letters.map((letter, i) =>
        ([
          'div',
          { style,
            attrs: {
              id: `${this.index}-letter-${i}`
            }
          },
          letter
        ])
      )
      elements[this.lastIndex] = [
        'div',
        { style: { ...style, ...{ marginRight: '4px' } } },
        this.letters[this.lastIndex]
      ]
      let BracketsActions = filteredActions.filter(action => action.type === 'brackets')
      if (BracketsActions.length > 0) {
        let bracketStyle = { ...this.style }
        bracketStyle.color = '#d3272c'
        for (let action of BracketsActions) {
          let message = '[' + action.message + ']\xa0'
          let el = [
            'div',
            { style: bracketStyle, attrs: { id: `${this.index}-bracket-${action.position}` } },
            message
          ]
          if (action.position === 'start') {
            elements.unshift(el)
          }
          if (action.position === 'end') {
            elements.push(el)
          }
        }
      }
      elements.forEach(el => {
        el[1].on = {
          mouseover: this.handleClick,
          click: this.handleClick
        }
      })
      return elements
    }
  },
  methods: {
    handleClick (event) {
      this.$root.$emit('position-caret', event.target.id)
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
