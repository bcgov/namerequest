<template>
  <v-col id="quick-search-names">
      <v-row class="quickSearchNames" v-for="name of namesList" :key="name.name">
        <b v-if="name.type==='exact'">{{name.name}}</b>
        <span v-else>{{name.name}}</span>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: { MainContainer }
})
export default class QuickSearchNames extends Vue {
  get namesList () {
    return newReqModule.quickSearchNames
  }
}

</script>

<style scoped lang="scss">
@import '@/assets/scss/theme.scss';
#quick-search-names {
    height: 300px;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    display: block;
    overflow: auto;
}
.quickSearchNames {
    font-size: 16px;
    color: $gray7;
    padding-left: 5px;
    padding-top: 15px;
}
</style>
