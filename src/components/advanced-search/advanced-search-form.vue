<template>
  <!-- Advanced Search Form -->
  <v-form id="advanced-nr-search-form" ref="advancedSearchForm" v-model="isValid" lazy-validation>

    <AdvancedSearchDates
      :dialog="dateDialog"
      @addDates="addDates($event)"
      @closeDialog="dateDialog = false"
    />

    <v-row no-gutters>
      <v-col>
        <span class="title-bold-16">Requested Business Name</span>
        <v-text-field
          filled
          class="mt-2"
          label="Requested Business Name"
          v-model="compName"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-n2">
      <v-col>
        <span class="title-bold-16">Applicant Name</span>
        <v-row>
          <v-col>
            <v-text-field
              filled
              label="First Name"
              v-model="applicantFirstName"
            />
          </v-col>
          <v-col>
            <v-text-field
              filled
              label="Last Name"
              v-model="applicantLastName"
              :rules="applicantLastNameRules"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-n4">
      <v-col>
        <span class="title-bold-16 mr-4">Submitted Date Range</span>
        <span v-if="hasAppliedDates" id="clear-date-btn" class="text-body-3 app-blue" @click="clearDates()">
          Clear <v-icon small>mdi-close</v-icon>
        </span>
        <v-row>
          <v-col>
            <v-text-field
              filled
              label="Start Date"
              hint="YYYY-MM-DD"
              persistent-hint
              append-icon="mdi-calendar"
              v-model="startDate"
              @click="dateDialog = true"
              @click:append="dateDialog = true"
              v-on:keydown="$event.preventDefault()"
            />
          </v-col>
          <v-col>
            <v-text-field
              filled
              label="End Date"
              hint="YYYY-MM-DD"
              persistent-hint
              append-icon="mdi-calendar"
              v-model="endDate"
              @click="dateDialog = true"
              @click:append="dateDialog = true"
              v-on:keydown="$event.preventDefault()"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

  </v-form>
</template>

<script lang='ts'>
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import AdvancedSearchDates from '@/components/advanced-search/advanced-search-dates.vue'

// Interfaces
import { AdvancedSearchI, FormType, StartEndDatesI } from '@/interfaces'

@Component({
  components: {
    AdvancedSearchDates
  }
})
export default class AdvancedSearchForm extends Vue {
  // Refs
  $refs!: {
    advancedSearchForm: FormType
  }

  /** Prompt the form to pass up the form data. */
  @Prop() readonly promptSubmit: boolean

  /** Advanced search dialog state. */
  @Prop() readonly advSearchDialogState: boolean

  // Local Properties
  private isValid = false
  private dateDialog = false

  // Local model
  private compName = ''
  private applicantFirstName = ''
  private applicantLastName = ''
  private startDate = ''
  private endDate = ''

  /** Validation rules for Applicant last name. */
  private applicantLastNameRules = []

  /** Is true when start and End dates are applied. */
  private get hasAppliedDates (): boolean {
    return !!this.startDate && !!this.endDate
  }

  /** True when the form is validating Names. */
  private get hasAppliedNameRules (): boolean {
    return !!this.applicantFirstName && !this.applicantLastName
  }

  /** Is true when the minimum search criteria is met. */
  private get hasMinimumSearchCriteria (): boolean {
    return !!this.compName || !!this.applicantLastName || (!!this.startDate && !!this.endDate)
  }

  /** Apply the date selections to local model. */
  private addDates (dates: StartEndDatesI): void {
    this.startDate = dates.startDate
    this.endDate = dates.endDate
  }

  /** Apply rules and validate form. */
  private async isValidForm (): Promise<boolean> {
    if (this.applicantFirstName) {
      this.applicantLastNameRules = [
        v => !!v || 'Last name is required'
      ]
    }
    await this.$refs.advancedSearchForm.validate()

    return this.hasMinimumSearchCriteria && this.isValid
  }

  /** Clear local dates. */
  private clearDates (): void {
    this.startDate = ''
    this.endDate = ''
  }

  @Watch('applicantFirstName')
  private clearApplicantRules (): void {
    if (!this.applicantFirstName) this.applicantLastNameRules = []
  }

  /** Clear form. */
  @Watch('advSearchDialogState')
  private clearForm (): void {
    this.compName = ''
    this.applicantFirstName = ''
    this.applicantLastName = ''
    this.clearDates()
  }

  @Watch('promptSubmit')
  @Watch('hasMinimumSearchCriteria')
  @Emit('isInvalid')
  private emitInvalid (): boolean {
    if (this.hasAppliedNameRules) return false

    return !this.hasMinimumSearchCriteria
  }

  @Watch('promptSubmit')
  @Emit('submitForm')
  private async emitSubmit () : Promise<AdvancedSearchI> {
    if (await this.isValidForm()) {
      return {
        compName: this.compName,
        firstName: this.applicantFirstName,
        lastName: this.applicantLastName,
        submittedStartDate: this.startDate,
        submittedEndDate: this.endDate
      }
    } return null
  }

  @Emit('closeDialog')
  private emitClose () : void {}
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

#find-nr-btn {
  color: $app-blue;
  font-size: .875rem;
}

#clear-date-btn {
  cursor: pointer;
}

::v-deep .v-icon {
  color: $app-blue;
}
</style>
