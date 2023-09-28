<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div
    v-if="state !== States.SUMMARY"
    id="business-fetch"
  >
    <v-text-field
      v-model.trim="searchField"
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      filled
      hide-details="auto"
      :hint="hint"
      label="Find an existing business"
      persistent-hint
      :error-messages="errorMessages"
      :loading="state === States.SEARCHING"
      :name="Math.random()"
      :readonly="state === States.SEARCHING"
      @click:append="search()"
      @input="reset()"
      @keydown.tab.exact="search()"
      @keyup.enter="search()"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { BusinessSearchIF } from '@/interfaces'
import { SearchStates as States } from '@/enums'

/*
 * See PPR's BusinessSearchAutocomplete.vue for a Composition API example.
 */
@Component({})
export default class BusinessFetch extends Vue {
  // Enum for template
  readonly States = States

  // Store action
  @Action searchBusiness!: (corpNum: string) => Promise<BusinessSearchIF>

  readonly hint = 'Enter the incorporation or registration number of the existing business'

  /** V-model for search field. */
  searchField = ''

  /** For custom error messages. */
  errorMessages = [] as Array<string>

  /** State of this component. */
  state = States.INITIAL

  /** Validates the search field, sets any error messages, and returns validity. */
  private validate (): boolean {
    if (!this.searchField) {
      this.errorMessages = ['Required field']
    } else if (!/^(A|BC|C|CP|FM|LLC|LP|PA|PAR|S|XCP|XL|XP|XS)( |)\d{7}$/i.test(this.searchField)) {
      this.errorMessages = [this.hint]
    } else {
      this.errorMessages = []
    }
    return (this.errorMessages.length === 0)
  }

  /** Clears errors and resets state. Called whenever users changes input. */
  reset (): void {
    this.errorMessages = []
    this.state = States.INITIAL
  }

  /** Searches for business and emits business search object. Called by various events. */
  @Emit('business')
  async search (): Promise<BusinessSearchIF> {
    // safety check
    if (this.state !== States.INITIAL) return

    // validate search field
    const valid = this.validate()
    if (!valid) return

    // perform search
    this.state = States.SEARCHING
    this.searchField = this.searchField.replace(' ', '').toUpperCase()
    const result = await this.searchBusiness(this.searchField).catch(e => null)

    // return result
    if (result) {
      this.state = States.SUMMARY
      return result
    }

    // show error
    this.state = States.INITIAL
    this.errorMessages = ['Business not found']
  }
}
</script>
