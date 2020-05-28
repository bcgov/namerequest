<template>
  <v-col cols="12" @keydown.enter="handleSubmit">
    <v-text-field :error-messages="message"
                  @input="clearErrors()"
                  autocomplete="off"
                  filled
                  id="name-input-text-field"
                  placeholder="Search a Name"
                  v-model="nameSearch">
      <template v-slot:append>
        <v-icon class="name-search-icon"
                id="name-input-icon"
                @click="handleSubmit">search</v-icon>
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
  handleSubmit (event: Event) {
    event.preventDefault()
    newReqModule.startAnalyzeName()
  }
}

</script>

<style lang="sass" scoped>

</style>
