<template>
  <v-dialog id="advanced-search-dialog" v-model="dialog" width="55rem" persistent :attach="attach">

    <v-card :class="{'retrieve-card-height': isTabRetrieve, 'tab-card-height': !isTabRetrieve}">
      <v-btn icon large class="dialog-close float-right" @click="emitClose()">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-tabs id="advanced-search-tabs">
        <v-tabs-items v-model="advSearchTab">

          <!-- Advanced Search Form -->
          <v-tab-item>
            <v-card-title>
              <span>Find an Existing Name Request</span>
            </v-card-title>

            <v-card-text class="copy-normal py-4">
              Find an existing Name Request by searching for one or more of the following criteria:
            </v-card-text>

            <!-- Validation error message -->
            <div v-if="invalidSearch" class="error-message copy-small my-n2">
              Enter at least one search criteria
            </div>

            <AdvancedSearchForm
              class="mt-4"
              :promptSubmit="toggleSearchSubmit"
              @isInvalid="invalidSearch = $event"
              @submitForm="submitForm($event)"
              @closeDialog="emitClose()"
            />
          </v-tab-item>

          <!-- Advanced Search Table -->
          <v-tab-item>
            <v-card-title>
              <span>Name Requests Found (18)</span>
            </v-card-title>

            <v-card-text class="copy-normal pt-5">
              Select the Name Request you would like to retrieve. To access the detailed summary screen, <br> you will
              need the email address of phone number of the Applicant.
            </v-card-text>

            <AdvancedSearchTable
              class="mt-6"
              @selectNameRequest="advSearchTab = AdvancedSearchTabs.ADVANCED_SEACH_RETRIEVE"
            />
          </v-tab-item>

          <!-- Advanced Search Retrieve Form -->
          <v-tab-item>
            <v-card-title>
              <span>Retrieve Name Request</span>
            </v-card-title>

            <v-card-text class="copy-normal pt-5">
              To view the details and status of this Name Request, please enter the <strong>email address or phone
              number</strong> of the Applicant.
            </v-card-text>

            <AdvancedSearchRetrieve
              class="mt-6"
              :promptSubmit="toggleRetrieveSubmit"
              @closeDialog="emitClose()"
            />
          </v-tab-item>

          <!-- Invalid Results -->
          <v-tab-item>
            <v-card-text class="copy-normal results-text">
              <h3>Too Many Name Requests Found</h3>
              <span class="my-6">Your search returned more than 1000 results.</span>
              <span class="mb-4">Please return to the previous screen and narrow your search by selecting more than
                  one search criteria and/or reducing your date range.</span>
            </v-card-text>
          </v-tab-item>

        </v-tabs-items>
      </v-tabs>

      <v-card-actions id="advanced-search-actions" class="justify-center pa-0">
          <v-btn
            id="adv-search-btn-1"
            class="mr-2"
            :class="{ 'button-blue': isTabResultsTable || isTabRetrieve }"
            text
            outlined
            @click="advSearchBtn1Actions()"
          >
            <span class="px-3">
              <v-icon v-if="!isTabSearchForm">mdi-chevron-left</v-icon>
              {{ advSearchBtn1 }}
              <v-icon v-if="isTabSearchForm">mdi-chevron-right</v-icon>
            </span>
          </v-btn>
          <v-btn
            id="adv-search-btn-2"
            :class="{ 'button-blue' : !isTabRetrieve }"
            text
            outlined
            @click="advSearchBtn2Actions()"
          >
            <span>
              {{ cancelBtnText }}<v-icon v-if="isTabRetrieve">mdi-chevron-right</v-icon>
            </span>
          </v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script lang='ts'>
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { sleep } from '@/plugins'
import { AdvancedSearchForm, AdvancedSearchRetrieve, AdvancedSearchTable } from '@/components/advanced-search'

// Interfaces & Enums
import { AdvancedSearchI } from '@/interfaces/models'
import { AdvancedSearchTabs } from '@/enums'

@Component({
  components: {
    AdvancedSearchForm,
    AdvancedSearchRetrieve,
    AdvancedSearchTable
  }
})
export default class AdvancedSearch extends Vue {
  // Declarations for template
  readonly AdvancedSearchTabs = AdvancedSearchTabs

  /** Prop to display the dialog. */
  @Prop() readonly dialog: boolean

  /** Prop to provide attachment selector. */
  @Prop() readonly attach: string

  // Local Properties
  private advSearchTab = 0
  private toggleSearchSubmit = false
  private toggleRetrieveSubmit = false
  private invalidSearch = false

  /** The current action button text dependant on tab state. */
  private get advSearchBtn1 (): string {
    switch (this.advSearchTab) {
      case AdvancedSearchTabs.ADVANCED_SEACH_FORM: return 'Find Name Request'
      case AdvancedSearchTabs.ADVANCED_SEACH_TABLE: return `Back`
      default: return 'Back'
    }
  }

  /** The current cancel button text dependant on tab state. */
  private get cancelBtnText (): string {
    switch (this.advSearchTab) {
      case AdvancedSearchTabs.ADVANCED_SEACH_FORM: return 'Cancel'
      case AdvancedSearchTabs.ADVANCED_SEACH_TABLE: return `Exit`
      case AdvancedSearchTabs.ADVANCED_SEACH_RETRIEVE: return `Retrieve Name Request`
      default: return 'Exit'
    }
  }

  /** Is true when NR retrieval is the current tab. */
  private get isTabSearchForm (): boolean {
    return this.advSearchTab === AdvancedSearchTabs.ADVANCED_SEACH_FORM
  }

  /** Is true when NR retrieval is the current tab. */
  private get isTabResultsTable (): boolean {
    return this.advSearchTab === AdvancedSearchTabs.ADVANCED_SEACH_TABLE
  }

  /** Is true when NR retrieval is the current tab. */
  private get isTabRetrieve (): boolean {
    return this.advSearchTab === AdvancedSearchTabs.ADVANCED_SEACH_RETRIEVE
  }

  /** Advanced search btn 1 actions. */
  private advSearchBtn1Actions (): void {
    switch (this.advSearchTab) {
      case AdvancedSearchTabs.ADVANCED_SEACH_FORM: this.toggleSearchSubmit = !this.toggleSearchSubmit
        break
      case AdvancedSearchTabs.ADVANCED_SEACH_TABLE: this.advSearchTab--
        break
      case AdvancedSearchTabs.ADVANCED_SEACH_RETRIEVE: this.advSearchTab--
        break
      default: this.advSearchTab = AdvancedSearchTabs.ADVANCED_SEACH_FORM
    }
  }

  /** Advanced search btn 2 actions. */
  private advSearchBtn2Actions (): void {
    switch (this.advSearchTab) {
      case AdvancedSearchTabs.ADVANCED_SEACH_RETRIEVE: this.toggleRetrieveSubmit = !this.toggleRetrieveSubmit
        break
      default: this.emitClose()
    }
  }

  /** Validate criteria and submit form for request. */
  private async submitForm (formData: AdvancedSearchI): Promise<void> {
    if (!formData) {
      this.invalidSearch = true
      return
    }

    // TODO: WIP...Make Request here for Advanced name search and handle results
    this.$root.$emit('showSpinner', true)
    await sleep(400) // Just Mocked for now
    const request = 'Success' // Mock request/response
    this.$root.$emit('showSpinner', false)

    // Direct to appropriate tab based on search results
    // WIP
    switch (!!request) {
      case true: this.advSearchTab = AdvancedSearchTabs.ADVANCED_SEACH_TABLE
        break
      case false: this.advSearchTab = AdvancedSearchTabs.ADVANCED_SEACH_INVALID
        break
    }
  }

  @Emit('closeDialog')
  private emitClose (): void {
    this.advSearchTab = 0
    this.invalidSearch = false
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.tab-card-height {
  height: 35rem;
}

.retrieve-card-height {
  max-height: 32rem;
}

#advanced-search-actions {
  .v-btn {
    min-width: 100px !important;
  }
}

.results-text {
  height: 18rem;
  padding-left: 80px !important;
  padding-right: 80px !important;
  text-align: center;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

::v-deep .v-tabs > .v-tabs-bar {
  display: none;
}

::v-deep .v-icon.v-icon {
  font-size: 1.25rem;
}
</style>
