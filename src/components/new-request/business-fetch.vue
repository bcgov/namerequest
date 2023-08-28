<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div id="business-fetch" v-if="state !== States.SUMMARY">
    <v-text-field
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      :error-messages="errorMessages"
      filled
      @keyup.enter="onItemSelected()"
      @click:append="onItemSelected()"
      :loading="state === States.SEARCHING"
      :name="Math.random()"
      hide-details="auto"
      hint="Enter registration number of existing business"
      label="Fetch an existing business"
      persistent-hint
      ref="searchField"
      :rules="rules"
      v-model="searchField"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { BusinessFetchIF, FormType } from '@/interfaces'

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

  // Refs
  $refs!: {
    searchField: FormType
  }

  // Store actions
  @Action fetchCorpNum!: (corpNum: string) => Promise<BusinessFetchIF>

  /** V-model for search field. */
  searchField = ''

  /** For custom error messages. */
  errorMessages = [] as Array<string>

  /** State of this component. */
  state = States.INITIAL

  /** Validation rules. */
  get rules (): Array<any> {
    function isValidCorpNum (corpNum: string): boolean {
      return (corpNum && corpNum.length === 9)
    }

    return [
      v => !!v || 'Required field',
      v => isValidCorpNum(v) || 'Please enter a valid registration number'
    ]
  }

  /** When an item has been selected, emits event with business object. */
  // *** TODO: fix validation issues
  @Emit('business')
  async onItemSelected (): Promise<BusinessFetchIF> {
    console.log(`*** validating = [${this.searchField}]`)
    const valid = this.$refs.searchField.validate()
    if (!valid) return

    // perform search
    // *** BC0870000 - in COLIN only
    // *** BC0871000 - does not exist
    // *** BC0871408 - in LEAR
    // *** FM1041131 - in LEAR
    this.state = States.SEARCHING
    const result = await this.fetchCorpNum(this.searchField).catch(e => null)

    if (result) {
      this.state = States.SUMMARY
      return result
    }

    // show error for 5 seconds
    this.state = States.INITIAL
    this.errorMessages = ['BUSINESS NOT FOUND']
    setTimeout(() => { this.errorMessages = [] }, 5000)
  }
}
</script>
