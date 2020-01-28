<template>
  <v-row no-gutters class="mt-1">
    <v-col cols="12">
      <v-form @submit="handleSubmit">
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
      </v-form>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class NewRequestNameInput extends Vue {
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
.name-search-icon
  color: $link
  cursor: pointer

</style>
