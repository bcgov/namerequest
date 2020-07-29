<template>
  <v-container id="consent-words">
    <h4>Some words require consent to be used</h4>
    <v-list class="consent-words-list">
      <v-row>
        <v-col cols="12" sm="6">
          <v-list-item
                  v-for="(item, i) in listItems1"
                  :key="i"
                  class="consent-words-list-item"
          >
            <p class="mb-0" v-html="item"></p>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item
                  v-for="(item, i) in listItems2"
                  :key="i"
                  class="consent-words-list-item"
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
export default class ConsentWords extends Vue {
  private listItems1 = ['Engineering', 'Engineering', 'Doctor, DR , MD', 'Registered Massage Therapist', 'Acupencture',
    'Chinese Medicine', 'Lawyer, Law', 'CPA', 'Registered Music Teacher', 'Honeywell', 'Legion',
    'Games (when used for a sport)']
  private listItems2 = ['Well known Trademarks', '(ex: Apple, Walmart, Pepsi etc.)', 'Well known public figures']
}

</script>

<style scoped lang="sass">
#consent-words
  p
    font-size: 14px

  .consent-words-list
    background: inherit

    .consent-words-list-item
      color: #495057
      font-size: 14px
      letter-spacing: 0
      line-height: 22px
      min-height: 0!important
      padding-left: 0
</style>
