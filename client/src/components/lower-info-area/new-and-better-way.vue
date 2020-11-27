<template>
  <v-container id="new-and-better-way" class="pt-16">
    <v-row no-gutters class="pa-9">
      <v-col cols="6" class="pl-3 pr-75">
        <v-img src="../../assets/images/bcnamerequest-laptop_x2.jpg" />
      </v-col>
      <v-col cols="6" class="pr-3 pl-75">
        <v-row>
          <v-col cols="12" class="h3 pb-5 mt-n5">
            A new and better way to get a name <br/>for your business in B.C.
          </v-col>
          <v-col cols="12">
            <ul>
              <li><span>Find out if you can have your name right away (<i>Coming soon</i>)</span></li>
              <li><span>Interactive help building a name</span></li>
              <li><span>Get alternatives when your name is not available</span></li>
              <li><span>Guidance picking the most appropriate business structure (<i>Coming soon</i>)</span></li>
              <li><span>Know how long it will take to get results for your name request</span></li>
              <li><span>Self-serve options to help track and manage your name request</span></li>
            </ul>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class NewAndBetterWay extends Vue {
}
</script>

<style lang="sass" scoped>
@import "@/assets/scss/base.scss"

#new-and-better-way
  max-width: none
  background-color: white

  ul

    li
      list-style-type: circle
      color: $BCgovABlue2
      padding: 5px 0

      span
        color: black
</style>
