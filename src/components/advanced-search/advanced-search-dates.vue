<template>
  <v-dialog id="advanced-search-dates" v-model="dialog" persistent max-width="44rem">
    <v-card height="32rem" class="py-6">
      <v-row>
        <v-col>
          <span class="title-bold-16" :class="{ 'error-message': validate && !hasStartDate }">Select Start Date:</span>
          <v-date-picker
            id="start-date-calendar"
            class="mt-2"
            v-model="startDateText"
            :max="currentDateString"
            elevation="5"
          >
          </v-date-picker>
        </v-col>
        <v-col>
          <span class="title-bold-16" :class="{ 'error-message': validate && !hasEndDate }">Select Start Date:</span>
          <v-date-picker
            id="end-date-calendar"
            class="mt-2"
            v-model="endDateText"
            :max="currentDateString"
            elevation="5"
          >
          </v-date-picker>
        </v-col>
      </v-row>
      <v-card-actions class="my-0 py-0 float-right">
          <v-btn id="btn-done" text color="primary" :ripple="false" @click="submitDates()"><strong>OK</strong></v-btn>
          <v-btn id="btn-cancel" text color="primary" :ripple="false" @click="emitClose()">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Emit, Prop, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

// Mixins
import { DateMixin } from '@/mixins'

// Interfaces
import { StartEndDatesI } from '@/interfaces/models'

@Component({})
export default class AdvancedSearchDates extends Mixins(DateMixin) {
  /** Prop to display the dialog. */
  @Prop() private dialog: boolean

  // Global getters
  @Getter getCurrentJsDate: Date

  private startDateText = ''
  private endDateText = ''
  private validate = false

  // local getters
  /** True when a start date has been selected. */
  get hasStartDate (): boolean {
    return !!this.startDateText
  }

  /** True when an end date has been selected. */
  get hasEndDate (): boolean {
    return !!this.endDateText
  }

  /** The current server date in string format. */
  get currentDateString (): string {
    return this.dateToDateString(this.getCurrentJsDate)
  }

  /** Validate and submit form. */
  private submitDates (): void {
    this.validate = true
    if (this.hasStartDate && this.hasEndDate) {
      this.emitDates()
      this.emitClose()
    }
  }

  /** Emit the Dates to parent form. */
  @Emit('addDates')
  private emitDates (): StartEndDatesI {
    return {
      startDate: this.startDateText,
      endDate: this.endDateText
    }
  }

  @Emit('closeDialog')
  private emitClose () : void {}
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

#btn-done, #btn-cancel {
  background-color: white !important;
  color: $app-blue !important;
  box-shadow: none !important;
}

::v-deep .v-picker {
  border-radius: 8px !important;

  .v-btn {
    height: 2rem !important;
    background-color: white !important;
    color: $gray7 !important;
    box-shadow: none !important;
  }
}

::v-deep .v-picker .v-btn--disabled {
  opacity: .4 !important;
}

::v-deep .theme--light.v-date-picker-table th {
  color: $gray9
}

::v-deep .v-date-picker-table__current {
  border-color: $app-blue !important;
  color: $app-blue !important;
}

::v-deep .theme--light.v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: $app-blue !important;
  border-color: $app-blue !important;
  color: white !important;
}

::v-deep .v-btn:not(.v-btn--text):not(.v-btn--outlined).v-btn--active:before {
  opacity: 0;
}

</style>
