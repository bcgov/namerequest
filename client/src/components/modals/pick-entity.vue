<template>
  <v-dialog v-model="showModal" :max-width="width">
    <v-card class="px-3 pt-3">
      <v-card-text style="display: flex; justify-items: center; width: 100%">
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
              <v-tooltip bottom max-width="500">
              <template v-slot:activator="scope">
                <span v-on="scope.on">{{ entity.text }}</span>
              </template>
              <template v-if="entity.blurb.length > 1">
                <ul class="text-left ma-0 pa-0">
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
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { SelectOptionsI } from '@/models'

@Component({})
export default class PickEntity extends Vue {
  get location () {
    return newReqModule.location
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
    if (this.location === 'BC') {
      return '900px'
    }
    return '660px'
  }

  chooseType (entity: SelectOptionsI) {
    let index = newReqModule.entityTypeOptions.findIndex((ent: any) => ent.value === entity.value)
    if (index === -1) {
      newReqModule.mutateExtendedEntitySelectOption(entity)
    }
    newReqModule.mutateEntityType(entity.value)
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

.yes-bullet
  list-style-position: inside
  margin-left: 30px

.clickable-cell:hover
  background-color: $grey-2
  cursor: pointer

</style>
