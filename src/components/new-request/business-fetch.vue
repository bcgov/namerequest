<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div id="business-fetch" v-if="state !== States.SUMMARY">
    <v-text-field
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      filled
      hide-details="auto"
      hint="Enter registration number of existing business"
      label="Fetch an existing business"
      persistent-hint
      v-model.trim="searchField"
      @click:append="search()"
      @input="reset()"
      @keydown.tab.exact="search()"
      @keyup.enter="search()"
      :error-messages="errorMessages"
      :loading="state === States.SEARCHING"
      :name="Math.random()"
      :readonly="state === States.SEARCHING"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { BusinessFetchIF } from '@/interfaces'

enum States {
  INITIAL = 'initial',
  SEARCHING = 'searching',
  SUMMARY = 'summary'
}

/*
 * See PPR's BusinessSearchAutocomplete.vue for a Composition API example.
 */
@Component({})
export default class BusinessFetch extends Vue {
  // Enum for template
  readonly States = States

  // Store action
  @Action fetchCorpNum!: (corpNum: string) => Promise<BusinessFetchIF>

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
    } else if (!/^(A|BC|C|CP|FM)\d{7}$/.test(this.searchField)) {
      this.errorMessages = ['Please enter a valid registration number']
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

  /** Searches for business and emits business fetch object. Called by various events. */
  @Emit('business')
  async search (): Promise<BusinessFetchIF> {
    // safety check
    if (this.state !== States.INITIAL) return

    // validate search field
    const valid = this.validate()
    if (!valid) return

    // perform search
    this.state = States.SEARCHING
    const result = await this.fetchCorpNum(this.searchField).catch(e => null)

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
