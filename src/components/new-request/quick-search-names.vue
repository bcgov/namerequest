<template>
  <v-col id="quick-search-names">
      <v-row class="quickSearchNames" v-for="name of getQuickSearchNames" :key="name.name">
        <b v-if="name.type==='exact'">{{name.name}}</b>
        <span v-else>{{name.name}}</span>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import MainContainer from '@/components/new-request/main-container.vue'

@Component({
  components: { MainContainer }
})
export default class QuickSearchNames extends Vue {
  // Global getter
  @Getter getQuickSearchNames!: any[]
}

</script>

<style scoped lang="scss">
@import '@/assets/styles/theme.scss';
#quick-search-names {
    height: 18.75rem;
    border-style: solid;
    border-width: 0.0625rem;
    border-radius: 0.3125rem;
    display: block;
    overflow: auto;
}
.quickSearchNames {
    font-size: $px-16;
    color: $text;
    padding-left: 0.3125rem;
    padding-top: 0.9375rem;
}
</style>
