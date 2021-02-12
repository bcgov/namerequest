<template>
  <v-row id="link-row" class="links-row text-body-4 px-2">
    <a id="nr-required-activator" @click="activateNRRModal()" class="pt-2">
      <v-col>
        <v-icon color="primary">mdi-help-circle-outline</v-icon> Check if you need a Name Request
      </v-col>
    </a>
    <a id="name-build-link" href="#name-build-info" class="middle-link pt-2">
      <v-col>
        <v-icon color="primary">mdi-help-circle-outline</v-icon> Learn how to build a name
      </v-col>
    </a>
    <a id="entity-selector-link" href="" class="pt-2">
      <v-col>
        <v-icon color="primary">mdi-help-circle-outline</v-icon> Help me choose a business type
        <v-icon color="primary" x-small>mdi-open-in-new</v-icon>
      </v-col>
    </a>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import newReqModule from '@/store/new-request-module'

@Component({})
export default class LinkRow extends Vue {
  activateNRRModal () {
    newReqModule.mutateNrRequiredModalVisible(true)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.links-row {
  min-height: 60px;
  background-color: $gray1;
  text-align: center;

  :hover {
    background-color: $app-lt-blue;
  }

  a {
    width: 33%;
    text-decoration: none;
  }

  .middle-link {
    border-left: 1px solid #DEE2E6;
    border-right: 1px solid #DEE2E6;
  }
}
</style>
