<template>
  <v-container id="example-name">
    <v-row>
      <v-col cols=6>
        <v-row>
          <img src="@/assets/images/Sarahsx1.png" />
        </v-row>
        <v-row>
          <div class="text-divider-1"></div>
        </v-row>
        <v-row class="mr-4 pr-9">
          <p class="text-content">Use unique words that will set you apart such as: <br>
            an individual's name; <br>
            a geographical location; <br>
            a coined, made-up word; <br>
            or an acronym.
          </p>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <img src="@/assets/images/Constructionx1.png" />
        </v-row>
        <v-row>
          <div class="text-divider-2"></div>
        </v-row>
        <v-row class="mr-4 pl-9">
          <p class="text-content">The second part of your name describes the "nature of your business".
            What is the service that your business is offering to the public?
          </p>
        </v-row>
      </v-col>
    </v-row>
    <v-divider class="ml-0 mb-4"></v-divider>
    <v-row class="ml-0">
      <h5>Improper name examples</h5>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <p><v-icon color="red" left>mdi-cancel</v-icon>Construction Renovation</p>
      </v-col>
      <v-col cols="12" sm="6">
        <p><v-icon color="red" left>mdi-cancel</v-icon>Renovation Development</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ExampleName extends Vue {}
</script>

<style scoped lang="scss">
#example-name {
  p {
    font-size: 14px;
    margin-bottom: 0;
  }

  .text-content {
    text-align: center;
  }
  .text-divider-1 {
    margin-left: 6.5rem;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    height: 2rem;
  }
  .text-divider-2 {
    margin-left: 9rem;
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    height: 2rem;
  }
}
</style>
