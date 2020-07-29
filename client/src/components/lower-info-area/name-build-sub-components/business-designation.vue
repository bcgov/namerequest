<template>
  <v-container id="business-designation">
    <h4>Words that can not be used by the public</h4>
    <v-list class="unavailable-words-list">
      <v-row>
        <v-col cols="12" sm="6">
          <v-list-item
                  v-for="(item, i) in listItems1"
                  :key="i"
                  class="business-designation-list-item"
          >
            <p class="mb-0" v-html="item"></p>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item
                  v-for="(item, i) in listItems2"
                  :key="i"
                  class="business-designation-list-item"
          >
            <p class="mb-0" v-html="item"></p>
          </v-list-item>
        </v-col>
      </v-row>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class BusinessDesignation extends Vue {
  private listItems1 = []
  private listItems2 = []
}

</script>

<style scoped lang="sass">
  #business-designation
    p
      font-size: 14px

    .business-designation-list
      background: inherit

      .business-designation-list-item
        color: #495057
        font-size: 14px
        letter-spacing: 0
        line-height: 22px
        min-height: 0!important
        padding-left: 0
</style>
