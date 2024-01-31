<template>
  <!-- once in Summary state, need to re-mount to reuse this component -->
  <div
    v-if="state !== States.SUMMARY"
    id="business-lookup"
  >
    <v-autocomplete
      v-model:search-input="searchField"
      filled
      no-filter
      :hide-no-data="state != States.NO_RESULTS"
      :items="searchResults"
      :loading="state === States.SEARCHING"
      :name="Math.random()"
      append-icon="mdi-magnify"
      autocomplete="chrome-off"
      autofocus
      hint="Search by name, incorporation or registration number of an existing business"
      item-text="identifier"
      hide-details="auto"
      persistent-hint
      return-object
      :label="lookupLabel"
      @input="onItemSelected($event)"
      @keydown.enter.native.prevent
    >
      <template #append>
        <v-progress-circular
          v-if="state === States.SEARCHING"
          color="primary"
          indeterminate
          :size="24"
          :width="2"
        />
      </template>

      <template #no-data>
        <p class="pl-5 font-weight-bold">
          {{ lookupNoActiveText }}
        </p>
        <p class="pl-5">
          Ensure you have entered the correct business name or number.
        </p>
      </template>
      <!-- Customize the results template -->
      <template #item="{ item }">
        <v-row class="business-lookup-result pt-1">
          <v-col
            cols="3"
            class="result-identifier"
          >
            {{ item.identifier }}
          </v-col>
          <v-col
            cols="7"
            class="result-name"
          >
            {{ item.name }}
          </v-col>
          <v-col
            cols="2"
            class="result-btn"
          >
            Select
          </v-col>
        </v-row>
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
import { EntityStates, EntityTypes, SearchStates as States } from '@/enums'

/*
 * See PPR's BusinessSearchAutocomplete.vue for a Composition API example.
 */
@Component({})
export default class BusinessLookup extends Vue {
  // Status of businesses to search for prop
  @Prop({ default: EntityStates.ACTIVE }) readonly searchStatus!: string

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

  /** Called when searchField property has changed. */
  @Watch('searchField')
  onSearchFieldChanged (): void {
    this.onSearchInputDebounced(this)
  }

  /**
   * Called when business lookup search status prop has changed.
   * Business lookup text based on the business status to search for.
   */
  @Watch('searchStatus', { immediate: true })
  onStatuschanged (): void {
    if (this.searchStatus === EntityStates.HISTORICAL) {
      this.lookupLabel = 'Find a historical business'
      this.lookupNoActiveText = 'No eligible historical business found'
    } else {
      this.lookupLabel = 'Find an existing business'
      this.lookupNoActiveText = 'No eligible active B.C. business found'
    }
  }

  private onSearchInputDebounced = debounce(async (that: this) => {
    // safety check
    if (that.searchField && that.searchField.length > 2) {
      that.state = States.SEARCHING
      that.searchResults = await BusinessLookupServices.search(that.searchField, that.searchStatus).catch(() => [])

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
      legalType: (input.legalType as unknown as EntityTypes),
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
.result-btn {
  color: $app-blue
}
// prevent Magnify icon from being rotated when list is displayed
::v-deep .v-input__icon .mdi-magnify {
  -webkit-transform: none !important;
  transform: none !important;
}
</style>
