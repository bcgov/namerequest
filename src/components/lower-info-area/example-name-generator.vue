<template>
  <v-container class="ma-9">
    <v-row>
      <v-col cols="4">
        <v-text-field  class="dotted-outline"
                       height="70"
                       hide-details
                       id="name-generator-1"
                       outlined
                       v-model="wordOne" />
      </v-col>
      <v-col cols="5">
        <v-text-field  class="dotted-outline"
                       height="70"
                       hide-details
                       id="name-generator-2"
                       outlined
                       v-model="wordTwo" />
      </v-col>
    </v-row>
    <v-row align="end">
      <v-col cols="4" class="pl-9">
        This will be a small copy block talking about creating a unique element for your name.
      </v-col>
      <v-col cols="4" class="pl-9">
        This will be a small copy block explaining how you need this second part of your business name.
      </v-col>
      <v-col cols="4" class="flex">
        <div class="block-box">
          <v-icon class="icon-class" @click="handleClick">mdi-refresh</v-icon>
        </div>
        <div class="block-box link-xsm" style="max-width: 50%">
          See another name example
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ExampleNameGenerator extends Vue {
  wordOne: string = 'Lorem'
  wordTwo: string = 'Placeholder'

  handleClick () {
    return null
  }
}
</script>

<style scoped lang="sass">
.block-box
  display: block
  color: $p-blue-text

.dotted-outline
  border: 1px dashed $pale-blue
  background-color: $gray1

.icon-class
  font-size: 40px !important
  color: $p-blue-text !important
  pointer: cursor

</style>
