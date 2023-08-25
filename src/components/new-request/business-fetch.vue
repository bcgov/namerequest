<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div id="business-fetch" v-if="state !== States.SUMMARY">
    <v-text-field
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      filled
      @change="onItemSelected()"
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
import { BusinessLookupResultIF, FormType } from '@/interfaces'
import { Sleep } from '@/plugins'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { EntityStates } from '@bcrs-shared-components/enums'

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
  // Refs
  $refs!: {
    searchField: FormType
  }

  // enum for template
  readonly States = States

  /** V-model for search field. */
  searchField = ''

  /** State of this component. */
  state = States.INITIAL

  /** Validation rules. */
  rules = [
    v => !!v || 'Required field',
    v => (!v || v.length === 9) || 'Please enter a valid registration number'
  ]

  /** When an item has been selected, emits event with business object. */
  @Emit('business')
  async onItemSelected (): Promise<BusinessLookupResultIF> {
    const valid = this.$refs.searchField.validate()
    if (!valid) return

    // set state and perform search
    this.state = States.SEARCHING
    await Sleep(1000) // *** TODO: perform search here

    // set state and return result
    this.state = States.SUMMARY
    return {
      identifier: this.searchField,
      legalType: CorpTypeCd.BC_COMPANY,
      bn: '',
      status: EntityStates.ACTIVE,
      name: this.searchField
    }
  }
}
</script>
