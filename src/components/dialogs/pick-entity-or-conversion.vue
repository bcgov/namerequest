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

      <template v-if="getIsConversion">
        <v-card-text>
          <v-container>
            <v-row class="category-bg">
              <v-col cols="12" class="font-weight-bold">Alterations</v-col>
            </v-row>
            <v-row v-for="(conversion, i) in $conversionTypes" :key="'conv-' + i">
              <v-col cols="12" class="clickable-cell"
                     :id="conversion.value"
                     @click="chooseConversion(conversion)">
                <v-tooltip bottom content-class="bottom-tooltip" transition="fade-transition" :disabled="isMobile">
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
                <v-tooltip bottom content-class="bottom-tooltip" transition="fade-transition" :disabled="isMobile">
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import { ConversionTypesI, EntityI, SelectOptionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { EntityType, Location } from '@/enums'

@Component({})
export default class PickEntityOrConversionDialog extends Vue {
  // Global getters
  @Getter getConversionTypeOptions!: ConversionTypesI[]
  @Getter getEntityBlurbs!: Array<EntityI>
  @Getter getEntityTypeCd!: EntityType
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getEntityTypesBC!: Array<EntityI>
  @Getter getEntityTypesXPRO!: Array<EntityI>
  @Getter getIsConversion!: boolean
  @Getter getLocation!: Location
  @Getter getLocationText!: string
  @Getter getPickEntityModalVisible!: boolean
  @Getter isMobile!: boolean

  // Global actions
  @Action setConversionType!: ActionBindingIF
  @Action setConversionTypeAddToSelect!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setEntityTypeAddToSelect!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF

  private showSocietiesInfo = false

  @Watch('showModal')
  handleModalClose (newVal) {
    if (!newVal) {
      setTimeout(() => { this.showSocietiesInfo = false }, 500)
    }
  }

  get entity_type_cd (): EntityType {
    return this.getEntityTypeCd
  }

  set entity_type_cd (value: EntityType) {
    this.setEntityTypeCd(value)
  }

  get locationText (): string {
    return (this.getLocationText === 'BC') ? 'British Columbia' : this.getLocationText
  }

  get showModal (): boolean {
    return this.getPickEntityModalVisible
  }

  set showModal (value: boolean) {
    this.setPickEntityModalVisible(value)
  }

  get tableData (): any[] {
    if (this.getLocation === Location.BC) {
      return this.tableDataBC
    } else {
      return this.tableDataXPRO
    }
  }

  get tableDataBC (): any[] {
    let categories = []
    for (let type of this.getEntityTypesBC) {
      let i = categories.indexOf(type.cat)
      if (i === -1) {
        categories.push(type.cat)
      }
    }
    const getEntities = (category) => {
      return this.getEntityTypesBC.filter(type => type.cat === category)
    }
    let output = categories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }

  get tableDataXPRO (): any[] {
    let categories = []
    for (let type of this.getEntityTypesXPRO) {
      let i = categories.indexOf(type.cat)
      if (i === -1) {
        categories.push(type.cat)
      }
    }
    const getEntities = (category) => {
      return this.getEntityTypesXPRO.filter(type => type.cat === category)
    }
    let output = categories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }

  get width (): string {
    if (this.showSocietiesInfo || this.getIsConversion) {
      return '550px'
    }
    let cols = this.tableData.length
    const maxThreshold = this.$vuetify.breakpoint.thresholds.sm

    // 210 per column with a max threshold of 960px
    return `${210 * cols > maxThreshold ? maxThreshold : 210 * cols}px`
  }

  // FUTURE: clean up return type
  entityBlurbs (entity_type_cd: string): string[][] | string[] | string {
    return this.getEntityBlurbs?.find(type => type.value === entity_type_cd)?.blurbs || []
  }

  clearEntitySelection (): void {
    this.entity_type_cd = EntityType.INFO
  }

  chooseConversion (conversion) {
    let index = this.getConversionTypeOptions.findIndex((conv: any) => conv.value === conversion.value)
    if (index === -1) {
      this.setConversionTypeAddToSelect(conversion)
    }
    // special case for sub-menu
    if (conversion.value !== 'INFO') {
      this.setEntityTypeCd(conversion.entity_type_cd)
    }
    this.setConversionType(conversion.value)
    this.showModal = false
  }

  chooseType (entity: SelectOptionsI) {
    if (entity.value === EntityType.SO || entity.value === EntityType.XSO) {
      this.showSocietiesInfo = true
      this.clearEntitySelection()
      return
    }
    let index = this.getEntityTypeOptions.findIndex((ent: any) => ent.value === entity.value)
    if (index === -1) {
      this.setEntityTypeAddToSelect(entity)
    }
    this.setEntityTypeCd(entity.value)
    this.showModal = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.v-data-table {
  margin: 0 -3px;
}

.category-bg {
  background-color: $gray1;
}

.cell {
  padding: 10px;
  color: $dk-text;
  display: flex;
}

.entity-link {
  width: 100%;
  text-decoration: none;
  text-align: left;
}

.clickable-cell {
  min-width: 180px;
  width: 100%;
  padding: 10px;

  &:hover {
    background-color: $app-lt-blue;
    cursor: pointer;
  }
}

.no-border {
  border-radius: 0 !important;
  text-decoration: none !important;
}
</style>
