<template>
  <v-row id="quick-search-names" no-gutters>
    <v-col class="pa-3">
      <v-row class="quickSearchNames" v-for="name of namesList" :key="name.name" no-gutters>
        <v-col>
          <b v-if="name.type==='exact'">{{name.name}}</b>
          <span v-else>{{name.name}}</span>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import MainContainer from '@/components/new-request/main-container.vue'

@Component({
  components: { MainContainer }
})
export default class QuickSearchNames extends Vue {
  // Global getter
  @Prop() namesList: Array<{ name: string, type: string }>
}

</script>

<style scoped lang="scss">
@import '@/assets/scss/theme.scss';
#quick-search-names {
  background-color: $gray1;
  display: block;
  max-height: 10rem;
  overflow: auto;
}
.quickSearchNames {
    font-size: 1rem;
    line-height: 1.75rem;
    color: $text;
}
</style>
