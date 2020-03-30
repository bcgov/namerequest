<template>
  <v-dialog v-model="showModal" :max-width="width" hide-overlay>
    <v-card class="pa-0" style="border-radius: 0" v-if="!showSocietiesInfo">
      <v-card-text style="display: flex; justify-items: center; width: 100%" class="py-4">
        <v-simple-table v-for="(catagory, i) in tableData" :key="'cat'+i">
          <tr>
            <th>
              <span class="h5" v-if="location === 'BC'">{{ catagory.text }}</span>
              <span class="h5" v-else>
                {{ location === 'CA' ? 'Canadian' : 'Foreign' }}
                <br>{{ catagory.text }}
              </span>
            </th>
          </tr>
          <tr v-for="(entity, n) in catagory.entities" :key="'ent'+n">
            <td class="clickable-cell" :id="entity.value" @click="chooseType(entity)">
              <v-tooltip bottom max-width="500" open-delay="500">
              <template v-slot:activator="scope">
                <button v-on="scope.on" class="small-link-sans-ul text-left">{{ entity.text }}</button>
              </template>
              <template v-if="entity.blurb.length > 1">
                <ul class="ma-0 pa-0">
                <li v-for="(text, i) in entity.blurb"
                    :class="i == 0 ? 'no-bullet' : 'yes-bullet'"
                    :key="i + '-blurb'">{{ text }}</li>
              </ul>
              </template>
              <template v-else>
                <span>{{ entity.blurb[0] }}</span>
              </template>
            </v-tooltip>
            </td>
          </tr>
        </v-simple-table>
      </v-card-text>
      <v-card-actions class="bg-grey-1 text-center">
        <div style="display: block; width: 100%;">
          <button @click="showModal = false"><v-icon>close</v-icon> Close</button>
        </div>
      </v-card-actions>
    </v-card>
    <v-card class="px-0 py-5" style="border-radius: 0" v-else>
      <v-card-text>
        <v-container fluid>
          <v-row no-gutters class="text-center">
            <v-col cols="12">To request a name for a Society</v-col>
            <v-col cols="12">please use the Societies Online website</v-col>
            <v-col cols="12">
              <a href="https://www.bcregistry.ca/societies/">https://www.bcregistry.ca/societies/</a>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { SelectOptionsI } from '@/models'

@Component({})
export default class PickEntity extends Vue {
  showSocietiesInfo = false

  @Watch('showModal')
  handleModalClose (newVal) {
    if (!newVal) {
      setTimeout(() => { this.showSocietiesInfo = false }, 500)
    }
  }

  get location () {
    return newReqModule.location
  }
  get entityType () {
    return newReqModule.entityType
  }
  set entityType (value) {
    newReqModule.mutateEntityType(value)
  }
  get showModal () {
    return newReqModule.pickEntityModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutatePickEntityModalVisible(value)
  }
  get tableData () {
    if (this.location === 'BC') {
      return this.tableDataBC
    } else {
      return this.tableDataXPRO
    }
  }
  get tableDataBC () {
    return newReqModule.pickEntityTableBC
  }
  get tableDataXPRO () {
    return newReqModule.pickEntityTableXPRO
  }
  get width () {
    if (this.showSocietiesInfo) {
      return '500px'
    }
    if (this.location === 'BC') {
      return '900px'
    }
    return '620px'
  }
  clearEntitySelection () {
    this.entityType = 'all'
  }

  chooseType (entity: SelectOptionsI) {
    if (entity.value === 'SO' || entity.value === 'XSO') {
      this.showSocietiesInfo = true
      this.clearEntitySelection()
      return
    }
    let index = newReqModule.entityTypeOptions.findIndex((ent: any) => ent.value === entity.value)
    if (index === -1) {
      newReqModule.mutateExtendedEntitySelectOption(entity)
    }
    newReqModule.mutateEntityType(entity.value)
    if (entity.value === 'SO' || entity.value === 'XSO') {
      this.showSocietiesInfo = true
      this.clearEntitySelection()
      return
    }
    this.showModal = false
  }
}

</script>
th
  border-bottom: 1px solid grey

<style lang="sass" scoped>
.no-bullet
  list-style-type: none
  margin-bottom: 8px
  line-height: 18px

.yes-bullet
  list-style-position: inside
  margin-left: 30px
  line-height: 18px

.clickable-cell:hover
  background-color: $grey-2
  cursor: pointer

</style>
