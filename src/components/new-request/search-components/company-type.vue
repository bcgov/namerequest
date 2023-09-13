<template>
  <v-col id="company-type" :cols="cols" :md="md">
    <header class="h6">Select a company type:</header>

    <v-radio-group
      class="mt-0 pt-6"
      hide-details
      mandatory
      row
      :value="getSearchCompanyType"
      @change="setSearchCompanyType($event)"
    >
      <v-radio
        id="named-company-radio"
        label="Named Company"
        :value="CompanyTypes.NAMED_COMPANY"
      />
      <v-radio
        id="numbered-company-radio"
        label="Numbered Company"
        :value="CompanyTypes.NUMBERED_COMPANY"
      />
    </v-radio-group>
  </v-col>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { SearchMixin } from '@/mixins'

@Component({})
export default class CompanyType extends Mixins(SearchMixin) {
  @Prop({ default: '12' }) readonly cols!: string
  @Prop({ default: '6' }) readonly md!: string
}
</script>

<style lang="scss" scoped>
::v-deep {
  // override radio group background color
  .v-input--radio-group .v-input__control .v-input__slot {
    background-color: white !important;
  }
}
</style>
