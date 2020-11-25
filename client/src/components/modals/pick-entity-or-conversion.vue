<template>
  <v-dialog v-model="showModal" :max-width="width" persistent>
    <v-card class="no-border pick-entity-card">
      <v-row>
        <v-col cols="11">
          <span class="ml-1 copy-small">{{ locationText }}:</span>
        </v-col>
        <v-col cols="1">
          <v-icon md color="primary" @click="showModal = false">mdi-close</v-icon>
        </v-col>
      </v-row>
      <template v-if="isConversion">
        <v-card-text>
          <v-container>
            <v-row class="category-bg">
              <v-col cols="12" class="font-weight-bold">Alterations</v-col>
            </v-row>
            <v-row v-for="(conversion, i) in conversionTypes" :key="'conv-' + i">
              <v-col cols="12" class="clickable-cell"
                     :id="conversion.value"
                     @click="chooseConversion(conversion)">
                <v-tooltip bottom content-class="bottom-tooltip" transition="fade-transition">
                  <template v-slot:activator="scope">
                    <button v-on="scope.on" class="link-sm-sans-ul entity-link">{{ conversion.desc }}</button>
                  </template>
                  <div v-for="(text, i) in entityBlurbs(conversion.value)" :key="'blurb-' + i">
                    <span>{{ text }}</span>
                  </div>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </template>
      <template v-else-if="!showSocietiesInfo">
        <v-card-text class="d-flex">
          <v-simple-table v-for="(category, i) in tableData" :key="'cat' + i">
            <tr class="category-bg cell">
              <th>
                <span class="font-weight-bold">{{ category.text }}</span>
              </th>
            </tr>
            <tr v-for="(entity, n) in category.entities" :key="'ent' + n">
              <td class="clickable-cell" :id="entity.value" @click="chooseType(entity)">
                <v-tooltip bottom content-class="bottom-tooltip" transition="fade-transition">
                  <template v-slot:activator="scope">
                    <button v-on="scope.on" class="link-sm-sans-ul entity-link">{{ entity.text }}</button>
                  </template>
                  <template>
                    <div v-for="(item, index) in entityBlurbs(entity.value)"
                         :key="`Blurb-${index}`">
                      <span :class="{ 'tooltip-bullet': index !== 0}">
                        {{ item }}
                      </span>
                    </div>
                  </template>
                </v-tooltip>
              </td>
            </tr>
          </v-simple-table>
        </v-card-text>
      </template>
      <template v-else>
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
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { SelectOptionsI } from '@/models'

@Component({})
export default class PickEntityOrConversion extends Vue {
  showSocietiesInfo = false

  @Watch('showModal')
  handleModalClose (newVal) {
    if (!newVal) {
      setTimeout(() => { this.showSocietiesInfo = false }, 500)
    }
  }

  get conversionTypes () {
    return newReqModule.conversionTypes
  }
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  set entity_type_cd (value) {
    newReqModule.mutateEntityType(value)
  }
  get isConversion () {
    return (newReqModule.request_action_cd === 'CNV')
  }
  get location () {
    return newReqModule.location
  }
  get locationText () {
    return newReqModule.locationText === 'BC' ? 'British Columbia' : newReqModule.locationText
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
    if (this.showSocietiesInfo || this.isConversion) {
      return '550px'
    }
    let cols = this.tableData.length
    const maxThreshold = this.$vuetify.breakpoint.thresholds.sm

    // 210 per column with a max threshold of 960px
    return `${210 * cols > maxThreshold ? maxThreshold : 210 * cols}px`
  }
  entityBlurbs (entity_type_cd: string) {
    return newReqModule.entityBlurbs.find(type => type.value === entity_type_cd)?.blurbs
  }
  clearEntitySelection () {
    this.entity_type_cd = 'INFO'
  }
  chooseConversion (conversion) {
    let index = newReqModule.conversionTypeOptions.findIndex((conv: any) => conv.value === conversion.value)
    if (index === -1) {
      newReqModule.mutateConversionTypeAddToSelect(conversion)
    }
    if (conversion.value !== 'INFO') {
      newReqModule.mutateEntityType(conversion.entity_type_cd)
    }
    newReqModule.mutateConversionType(conversion.value)
    this.showModal = false
  }
  chooseType (entity: SelectOptionsI) {
    if (entity.value === 'SO' || entity.value === 'XSO') {
      this.showSocietiesInfo = true
      this.clearEntitySelection()
      return
    }
    let index = newReqModule.entityTypeOptions.findIndex((ent: any) => ent.value === entity.value)
    if (index === -1) {
      newReqModule.mutateEntityTypeAddToSelect(entity)
    }
    newReqModule.mutateEntityType(entity.value)
    this.showModal = false
  }
}

</script>
<style lang="sass" scoped>
.v-data-table
  margin: 0 -3px
.category-bg
  background-color: #F1F3F5
.cell
  padding: 10px
  color: #212529
  display: flex
.entity-link
  width: 100%
  text-decoration: none
  text-align: left
.clickable-cell
  min-width: 180px
  width: 100%
  padding: 10px

  &:hover
    background-color: $grey-2
    cursor: pointer
.no-border
  border-radius: 0 !important
  text-decoration: none !important

</style>
