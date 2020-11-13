<template>
  <v-col cols="12">
    <v-text-field :error-messages="message"
                  @input="clearErrors()"
                  @keydown.enter="handleSubmit"
                  autocomplete="off"
                  filled
                  id="name-input-text-field"
                  placeholder="Enter a Name"
                  v-model="nameSearch">
      <template v-slot:append>
        <v-icon class="name-search-icon"
                id="name-input-icon"
                color="primary"
                @click="startAnalyzeName">mdi-magnify</v-icon>
      </template>
    </v-text-field>
  </v-col>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class NameInput extends Vue {
  get errors () {
    return newReqModule.errors
  }
  get message () {
    if (this.errors.includes('length')) {
      return ['Please enter a longer name']
    }
    if (this.errors.includes('name')) {
      return ['Please enter a name to search for']
    }
    return ''
  }
  get nameSearch () {
    return newReqModule.name
  }
  set nameSearch (name: string) {
    newReqModule.mutateName(name)
  }

  clearErrors () {
    newReqModule.clearErrors()
  }
  handleSubmit (event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.startAnalyzeName()
      return
    }
    return event
  }
  startAnalyzeName () {
    newReqModule.startAnalyzeName()
  }
}

</script>

<style lang="sass" scoped>

</style>
