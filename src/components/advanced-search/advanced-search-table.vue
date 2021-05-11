<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="[]"
      :items-per-page="5"
      class="elevation-1"
      hide-default-footer
    >
      <template v-slot:item="row" class="advanced-search-results">
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </template>
    </v-data-table>
    <v-btn @click="mockSelectNR">Mock Select NR</v-btn>
  </div>
</template>

<script lang='ts'>
import { Component, Emit, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class AdvancedSearchTable extends Vue {
  // Global setter
  @Action setExistingRequestSearch!: ActionBindingIF

  // Local Properties
  private readonly headers: Array<any> = [
    { text: 'Submitted Date', align: 'start', value: 'date' },
    { text: 'Request Name(s)', value: 'businessName' },
    { text: 'Applicant Name', value: 'applicantName' }
  ]

  // TODO: Replace with method tied to table row to set the NR dynamically
  @Emit('selectNameRequest')
  private mockSelectNR (): void {
    this.setExistingRequestSearch({ key: 'nrNum', value: 'NR1031820' }) // NR Set through table MUST be uppercase
  }
}
</script>
