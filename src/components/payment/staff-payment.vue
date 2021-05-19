<template>
  <div id="staff-payment" class="pt-6">
    <staff-payment-component
      :staffPaymentData="getStaffPayment"
      :validate="doValidate"
      :displaySideLabel="false"
      :displayPriorityCheckbox="false"
      @update:staffPaymentData="onStaffPaymentDataUpdate($event)"
      @valid="onStaffPaymentValidity($event)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import { StaffPayment as StaffPaymentComponent } from '@bcrs-shared-components/staff-payment'

// Interfaces and Enums
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { StaffPaymentIF } from '@/interfaces'
import { StaffPaymentOptions } from '@/enums'

@Component({
  components: {
    StaffPaymentComponent
  }
})
export default class StaffPayment extends Vue {
  /** Get staff payment from store. */
  @Getter getStaffPayment!: StaffPaymentIF

  /** Set staff payment in store. */
  @Action setStaffPayment!: ActionBindingIF

  /** Whether to validate the data. */
  @Prop({ default: false }) readonly doValidate: boolean

  /** Called when component's staff payment data has been updated. */
  private onStaffPaymentDataUpdate (val: StaffPaymentIF) {
    let staffPaymentData: StaffPaymentIF = { ...this.getStaffPayment, ...val }

    switch (staffPaymentData.option) {
      case StaffPaymentOptions.FAS:
        staffPaymentData = {
          option: StaffPaymentOptions.FAS,
          routingSlipNumber: staffPaymentData.routingSlipNumber,
          isPriority: staffPaymentData.isPriority,
          bcolAccountNumber: '',
          datNumber: '',
          folioNumber: ''
        }
        break

      case StaffPaymentOptions.BCOL:
        staffPaymentData = {
          option: StaffPaymentOptions.BCOL,
          bcolAccountNumber: staffPaymentData.bcolAccountNumber,
          datNumber: staffPaymentData.datNumber,
          folioNumber: staffPaymentData.folioNumber,
          isPriority: staffPaymentData.isPriority,
          routingSlipNumber: ''
        }
        break

      case StaffPaymentOptions.NO_FEE:
        staffPaymentData = {
          option: StaffPaymentOptions.NO_FEE,
          routingSlipNumber: '',
          isPriority: false,
          bcolAccountNumber: '',
          datNumber: '',
          folioNumber: ''
        }
        break

      case StaffPaymentOptions.NONE: // should never happen
        break
    }

    this.setStaffPayment(staffPaymentData)
  }

  /** Called when component's validity has changed. */
  @Emit('isValid')
  private onStaffPaymentValidity (val: boolean): void {}
}
</script>

<style lang="scss" scoped>
// override internal whitespace so we can specify it above
::v-deep #staff-payment-container {
  padding: 0 !important;
  margin: 0 !important;
}

// override default radio input background colour
::v-deep .v-input--radio-group__input {
  background-color: white;
}
</style>
