<template>
  <v-dialog v-model="showModal" max-width="600px">
    <v-card class="pa-3" id="pick-request-type-modal-card">
      <v-card-text class="h3">What would you like to do?</v-card-text>
      <v-container class="my-n4 pt-0">
        <v-row>
          <v-col cols="6">
            <v-simple-table class="text-center">
          <tr v-for="type in tableDataCol1" :key="type.value+'-tr'">
            <td class="clickable-cell" :id="type.value" @click="chooseType(type)"><v-tooltip bottom>
              <template v-slot:activator="scope">
                <span v-on="scope.on">{{ type.text }}</span>
              </template>
              <span>{{ type.blurb }}</span>
            </v-tooltip>
            </td>
          </tr>
        </v-simple-table>
          </v-col>
          <v-col cols="6">
            <v-simple-table class="text-center">
          <tr v-for="type in tableDataCol2" :key="type.value+'-tr'">
            <td class="clickable-cell" :id="type.value" @click="chooseType(type)"><v-tooltip bottom>
              <template v-slot:activator="scope">
                <span v-on="scope.on">{{ type.text }}</span>
              </template>
              <span>{{ type.blurb }}</span>
            </v-tooltip>
            </td>
          </tr>
        </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { SelectOptionsI } from '@/models'

@Component({})
export default class PickRequestType extends Vue {
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
    if (request.value !== 'NEW') {
      newReqModule.mutateExtendedRequestType(request)
    }
    newReqModule.mutateRequestType(request.value)
    this.showModal = false
  }
}

</script>

<style lang="sass" scoped>
.clickable-cell:hover
  background-color: $grey-2
  cursor: pointer

</style>
