<template>
  <v-dialog v-model="display" width="45rem" persistent :attach="attach">
    <v-card>
      <v-row no-gutters>
        <v-col cols="6" class="text-end">
          <v-icon class="mr-n4" :color="options.iconColor" size="2.5rem">{{ options.icon }}</v-icon>
        </v-col>
        <v-col>
          <v-btn cols="6" class="close-btn outlined" icon :ripple="false" size="2.5rem" @click="proceed(false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <p class="dialog-title ma-0 pt-5">
        {{ options.title }}
      </p>
      <v-card-text class="pt-10">
        <p v-for="line, index in options.text"
            :key="index"
            class="copy-normal ma-0 pb-5"
            v-html="line">
          {{ line }}
        </p>
      </v-card-text>
      <v-row class="pt-7" justify="center" no-gutters>
        <v-col v-if="options.cancelText" cols="auto">
          <v-btn class="cancel-btn outlined" outlined @click="proceed(false)">
            {{ options.cancelText }}
          </v-btn>
        </v-col>
        <v-col v-if="options.acceptText" class="pl-3" cols="auto">
          <v-btn class="accept-btn" @click="proceed(true)">
            {{ options.acceptText }}
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// external
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

import { DialogOptionsI } from '@/interfaces'

@Component({})
export default class NameCheckIssuesDialog extends Vue {
  @Prop() private readonly attach: string
  @Prop() private readonly display: boolean
  @Prop() private readonly options: DialogOptionsI

  @Emit() private proceed (val: boolean) { }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.accept-btn {
  font-size: 0.875rem !important;
  font-weight: bold;
}
.close-btn {
  float: right;
  box-shadow: none !important;
}
.close-btn:before {
  box-shadow: none !important;
  background-color: transparent !important;
}
.dialog-title {
  color: $gray9;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}
</style>
