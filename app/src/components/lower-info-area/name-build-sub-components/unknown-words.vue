<template>
  <v-container id="unknown-words">
    <h4>Unknown words</h4>

    <p class="my-6">
      There are some coined words that have never been examined. When a name includes one of these words
      it will not be available for auto approval. You can choose to change your name or you can submit the name as is
      for examination.
    </p>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class UnknownWords extends Vue {}
</script>

<style scoped lang="scss">
@import '@/assets/styles/theme.scss';

#unknown-words {
  p {
    font-size: $px-14;
  }
}
</style>
