<template>
  <v-dialog
    v-model="showModal"
    id="pick-request-type-modal"
    max-width="45rem"
    hide-overlay
    persistent
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h4>What would you like to do?</h4>
        <v-btn icon large class="dialog-close" @click="showModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="6" class="d-block">
            <ul v-for="(item, i) in tableData.col1" :key="`col1-${i}`">
              <li class="clickable-cell" @click="chooseType(item)">
                <button class="link-sm-sans-ul">{{ item.text }}</button>
              </li>
            </ul>
          </v-col>
          <v-col cols="6">
            <ul v-for="(item, i) in tableData.col2" :key="`col2-${i}`">
              <li class="clickable-cell" @click="chooseType(item)">
                <button class="link-sm-sans-ul">{{ item.text }}</button>
              </li>
            </ul>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Interfaces / enums / list data
import { RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class PickRequestTypeDialog extends Vue {
  // Global getter
  @Getter getPickRequestTypeModalVisible!: boolean

  // Global actions
  @Action setClearErrors!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setPickRequestTypeModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF

  get showModal () {
    return this.getPickRequestTypeModalVisible
  }

  set showModal (value: boolean) {
    this.setPickRequestTypeModalVisible(value)
  }

  get tableData () {
    // get just the selectable items
    const items = this.$requestActions.filter(item => !item.isHeader)

    const length = items.length
    const midIndex = length % 2 ? (length + 1) / 2 : (length / 2)

    return {
      col1: items.slice(0, midIndex),
      col2: items.slice(midIndex, length)
    }
  }

  chooseType (request: RequestActionsI) {
    this.setClearErrors(null)
    if (request.value !== 'NEW') {
      this.setExtendedRequestType(request)
    }
    this.setRequestAction(request.value)
    this.showModal = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.clickable-cell:hover {
  background-color: $app-lt-blue;
}

// override button text centering
.clickable-cell button {
  text-align: unset;
}
</style>
