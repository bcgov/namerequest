<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div id="business-lookup" v-if="state !== States.SUMMARY">
    <v-autocomplete
      :hide-no-data="state != States.NO_RESULTS"
      :items="searchResults"
      :loading="state === States.SEARCHING"
      :name="Math.random()"
      :search-input.sync="searchField"
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      filled
      hint="Search by name, incorporation or registration number of existing business"
      item-text="name"
      item-value="identifier"
      :label="lookupLabel"
      hide-details="auto"
      no-filter
      persistent-hint
      return-object
      @input="onItemSelected($event)"
      @keydown.enter.native.prevent
    >
      <template v-slot:append>
        <v-progress-circular
          v-if="state === States.SEARCHING"
          color="primary"
          indeterminate
          :size="24"
          :width="2"
        />
      </template>

      <template v-slot:no-data>
        <p class="pl-5 font-weight-bold">
          {{  lookupNoActiveText }}
        </p>
        <p class="pl-5">
          Ensure you have entered the correct business name or number.
        </p>
      </template>
    </v-autocomplete>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import { debounce } from 'lodash'
import { BusinessLookupResultIF, BusinessSearchIF } from '@/interfaces'
import BusinessLookupServices from '@/services/business-lookup-services'
import { EntityType } from '@/enums'

enum States {
  INITIAL = 'initial',
  SEARCHING = 'searching',
  SHOW_RESULTS = 'show results',
  NO_RESULTS = 'no results',
  SUMMARY = 'summary'
}

/*
 * See PPR's BusinessSearchAutocomplete.vue for a Composition API example.
 */
@Component({})
export default class BusinessLookup extends Vue {
  // Status of businesses to search for prop
  @Prop({ default: 'ACTIVE' }) readonly businessStatus!: string

  // enum for template
  readonly States = States

  /** V-model for search field. */
  searchField = ''

  /** Results from business lookup API. */
  searchResults = [] as Array<BusinessLookupResultIF>

  /** State of this component. */
  state = States.INITIAL

  /** Business Lookup labels and warnings. */
  lookupLabel = ''
  lookupNoActiveText = ''

  /** Set business lookup text on mount. */
  mounted (): void {
    this.setLookupText()
  }

  /** Called when searchField property has changed. */
  @Watch('searchField')
  onSearchFieldChanged (): void {
    this.onSearchInputDebounced(this)
  }

  /** Called when business lookup search status prop has changed. */
  @Watch('businessStatus')
  onStatuschanged (): void {
    this.setLookupText()
  }

  /** Business lookup text based on the business status to search for. */
  private setLookupText (): void {
    if (this.businessStatus === 'HISTORICAL') {
      this.lookupLabel = 'Find a historical business'
      this.lookupNoActiveText = 'No historical business found'
    } else {
      this.lookupLabel = 'Find an existing business'
      this.lookupNoActiveText = 'No active B.C. business found'
    }
  }

  private onSearchInputDebounced = debounce(async (that: this) => {
    // safety check
    if (that.searchField && that.searchField.length > 2) {
      that.state = States.SEARCHING
      const searchStatus = this.businessStatus // search for status based on prop
      that.searchResults = await BusinessLookupServices.search(that.searchField, searchStatus).catch(() => [])

      // display appropriate section
      that.state = (that.searchResults.length > 0) ? States.SHOW_RESULTS : States.NO_RESULTS
    } else {
      // reset variables
      that.searchResults = []
      that.state = States.INITIAL
    }
  }, 600)

  /** When an item has been selected, emits business search object. */
  @Emit('business')
  onItemSelected (input: BusinessLookupResultIF): BusinessSearchIF {
    // safety check
    if (input) {
      // change to summary state
      this.state = States.SUMMARY
    }
    return {
      identifier: input.identifier,
      legalName: input.name,
      legalType: (input.legalType as unknown as EntityType),
      state: input.status
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.font-size-12 {
  font-size: $px-12;
}

p {
  color: $gray7;
}

.business-lookup-result {
  font-size: $px-14;
  color: $gray7;

  &:hover {
    background-color: $gray1;
    color: $app-blue;
  }
}

.result-identifier,
.result-name {
  font-size: $px-16;

  // limit col width and show an ellipsis for long names:
  max-width: 485px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-action {
  text-align: right;
  font-size: $px-14;

  .select {
    color: $app-blue;
  }

  .added {
    color: $app-green;
  }
}

// prevent Magnify icon from being rotated when list is displayed
::v-deep .v-input__icon .mdi-magnify {
  -webkit-transform: none !important;
  transform: none !important;
}
</style>
