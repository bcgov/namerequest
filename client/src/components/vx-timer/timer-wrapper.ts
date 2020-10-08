import Vue from 'vue'
import ComponentExample from '@/components/ComponentExample.vue'

const WrappedComponent = (component) => {
  return Vue.component('withSubscription', {
    render (createElement) {
      return createElement(component)
    }
  })
}

const EnhancedComponent = WrappedComponent(ComponentExample)
