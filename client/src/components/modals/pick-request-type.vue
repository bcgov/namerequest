<template>
  <v-dialog v-model="showModal"
            id="pick-request-type-modal"
            max-width="600px"
            hide-overlay>
    <v-card class="pa-0" id="pick-request-type-modal-card">
      <v-card-text class="h4 pa-3 px-5">What would you like to do?</v-card-text>
      <v-container class="my-n4 pt-0">
        <v-row>
          <v-col cols="6">
            <v-simple-table class="text-left">
          <tr v-for="type in tableDataCol1" :key="type.value+'-tr'">
            <td class="clickable-cell" :id="type.value" @click="chooseType(type)">
              <v-tooltip bottom max-width="500" open-delay="500">
              <template v-slot:activator="scope">
                <button class="small-link-sans-ul" v-on="scope.on">{{ type.text }}</button>
              </template>
              <span>{{ type.blurb }}</span>
            </v-tooltip>
            </td>
          </tr>
        </v-simple-table>
          </v-col>
          <v-col cols="6">
            <v-simple-table class="text-left">
          <tr v-for="type in tableDataCol2" :key="type.value+'-tr'">
            <td class="clickable-cell" :id="type.value" @click="chooseType(type)">
              <v-tooltip bottom max-width="500" open-delay="500">
              <template v-slot:activator="scope">
                <button class="small-link-sans-ul" v-on="scope.on">{{ type.text }}</button>
              </template>
              <span>{{ type.blurb }}</span>
            </v-tooltip>
            </td>
          </tr>
        </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions class="bg-grey-1 text-center">
        <div style="display: block; width: 100%;">
          <button @click="showModal = false"><v-icon>close</v-icon> Close</button>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { SelectOptionsI } from '@/models'

@Component({})
export default class PickRequestType extends Vue {
  get editMode () {
    return newReqModule.editMode
  }
  get showModal () {
    return newReqModule.pickRequestTypeModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutatePickRequestTypeModalVisible(value)
  }
  get tableDataCol1 () {
    let data = [...newReqModule.requestTypes]
    return data.slice(0, 4)
  }
  get tableDataCol2 () {
    let data = [...newReqModule.requestTypes]
    return data.slice(4, 8)
  }

  chooseType (request: SelectOptionsI) {
    newReqModule.clearErrors()
    if (request.value !== 'NEW') {
      newReqModule.mutateExtendedRequestType(request)
    }
    newReqModule.mutateRequestAction(request.value)
    this.showModal = false
  }
}

</script>

<style lang="sass" scoped>
.clickable-cell:hover
  background-color: $grey-2
  cursor: pointer

</style>
