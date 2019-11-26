<template>
  <v-container id="landing-container" fluid>
    <v-row no-gutters>
      <v-col>
        <v-container id="landing-upper">
          <v-row no-gutters>
            <v-col class="pt-5 fs-20 fw-700">
              Comming Soon...
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
 </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AnalyzeNameSearchType from '@/components/analyze-name/analyze-name-search-type.vue'
import AnalyzeNameInput from '@/components/analyze-name/analyze-name-input.vue'

@Component({
  components: { AnalyzeNameInput, AnalyzeNameSearchType }
})
export default class Landing extends Vue {}

</script>

<style lang="scss" scoped>
#landing-container {
  margin: 0;
  padding: 0;
}

#landing-upper {
  background: url('../assets/images/analyze-name-bg.jpg');
  background-size: 1380px 500px;
  height: 500px;
  color: white;
  padding: 0 200px 0 200px;
}

</style>
