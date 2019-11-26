<template>
  <v-container id="landing-container" fluid>
    <v-row no-gutters>
      <v-col>
        <v-container id="landing-upper">
          <v-row no-gutters>
            <v-col>
              <span class="fs-45 fw-700 pt-2">Name Request</span>
              <p class="fs-16 fw-700">Find a name for your business or lookup the status of an existing Name Request</p>
            </v-col>
          </v-row>
          <AnalyzeNameSearchType />
          <v-row>
            <v-col><AnalyzeNameInput /></v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <v-row>
      <v-col>{{ request }}</v-col>
    </v-row>
 </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import AnalyzeNameSearchType from '@/components/analyze-name/analyze-name-search-type.vue'
  import AnalyzeNameInput from '@/components/analyze-name/analyze-name-input.vue'
  import { SearchType } from '@/models'
  import analyzeName from '@/store/analyze-name-module'

  @Component({
    components: { AnalyzeNameInput, AnalyzeNameSearchType }
  })

  export default class Landing extends Vue {
    private get request() {
      return analyzeName.searchType
    }
  }

</script>

<style lang="stylus" scoped>
  #landing-container
    margin 0
    padding 0

  #landing-upper
    background url('../assets/images/analyze-name-bg.jpg')
    background-size 1380px 500px
    height 500px
    color white
    padding 0 200px 0 200px

</style>
