<template>
  <v-col cols="12">
    <v-text-field :error-messages="message"
                  @input="clearErrors()"
                  @keydown.enter="handleSubmit"
                  autocomplete="off"
                  filled
                  id="name-input-text-field"
                  :label="nameLabel"
                  v-model="nameSearch">
      <template v-slot:append>
        <v-tooltip bottom
                   content-class="bottom-tooltip search-tooltip"
                   transition="fade-transition"
                   :disabled="!isSearchAgain">
          <template v-slot:activator="scope">
            <v-icon class="name-search-icon"
                    id="name-input-icon"
                    color="primary"
                    v-on="scope.on"
                    @click="startAnalyzeName">mdi-magnify</v-icon>
          </template>
          Search Again
        </v-tooltip>
      </template>
    </v-text-field>
  </v-col>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class NameInput extends Vue {
  @Prop({ default: false }) isSearchAgain: boolean
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
  get nameLabel () {
    return newReqModule.location !== 'BC'
      ? 'Enter the full legal name that the business uses in its home jurisdiction'
      : 'Enter a Name'
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

<style lang="scss" scoped>
.search-tooltip {
  max-width: 100px;
  text-align: center;
  padding: 10px !important;
}
</style>
