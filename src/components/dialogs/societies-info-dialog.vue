<template>
    <v-dialog v-model="showModal" width="45rem" persistent content-class="custom-dialog">
      <v-card>
        <v-row>
          <v-col cols="10">
            <span class="copy-small"></span>
          </v-col>
          <v-col cols="2">
            <v-icon
            class="float-right"
            md
            color="primary"
            @click="emitClose()"
          >
          mdi-close
          </v-icon>
          </v-col>
        </v-row>
        <v-card-text class="mt-n12">
          <v-container fluid>
            <v-row no-gutters class="text-center">
              <v-col cols="12">
                To request a {{ type }} for a Society
              </v-col>
              <v-col cols="12">
                please use the Societies Online website
              </v-col>
              <v-col cols="12">
                <a href="https://www.bcregistry.ca/societies/">https://www.bcregistry.ca/societies/</a>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class SocietiesInfo extends Vue {
  @Prop() readonly type: boolean
  @Getter getSocietiesModalVisible!: boolean
  @Action setSocietiesModalVisible!: ActionBindingIF

  get showModal () {
    return this.getSocietiesModalVisible
  }
  set showModal (value: boolean) {
    this.setSocietiesModalVisible(value)
  }

  emitClose (): void {
    this.showModal = false
    this.$parent.closeSocietyDialog()
  }
}
</script>
