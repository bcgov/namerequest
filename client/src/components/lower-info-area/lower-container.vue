<template>
  <v-container fluid id="lower-container">
    <v-row no-gutters class="bg-grey-1 pa-9">
      <v-col cols="6" class="pr-9 pl-3">
        <v-card class="ma-9 py-6 px-9">
          <v-card-title class="h3">Top 10 Words Approved This Week</v-card-title>
          <v-card-subtitle class="pt-3 normal-copy">
            Try to stand out, choose a name that isn't widely used
          </v-card-subtitle>
          <v-card-text class="mt-n6 mb-n5">
            <v-container>
              <v-row>
                <v-col cols="6">
                  <ol>
                    <li v-for="(n,  key) in 5" :key="`li+${key}`">
                      <span class="bold-text">Name {{ key + 1 }}</span>
                    </li>
                  </ol>
                </v-col>
                <v-col cols="6">
                  <ol start="6">
                    <li v-for="(n,  key) in 5" :key="`li+${key}`">
                      <span class="bold-text">Name {{ key + 6 }}</span>
                    </li>
                  </ol>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" class="mt-9 pt-6 pl-9">
        <v-row>
          <v-col cols="12" class="h3">Avoid Certain Words</v-col>
          <v-col cols="11">
            Name approvals can be delayed or declined if they contain popular words, words that require consent, words
            that are trademarked or otherwise cannot be used. Lorem ipsum dolor sit amet to make this longer.
          </v-col>
          <v-col>
            <v-btn deopressed>Learn More</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-9 py-3">
      <v-col cols="6" class="pr-9">
        <v-card flat class="ma-9">
          <v-card-title class="h3">How to Build Your Name</v-card-title>
          <v-card-text class="normal-text">
            Content to come from Lorna will go here. Your name must contain 3 important components. First, it must have
            a Distinctive element  lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
            <p class="mt-4">See the examples here to learn more about creating a unique name for your new business.</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" class="pl-9">
        <ExampleNameGenerator />
      </v-col>
    </v-row>
    <v-row no-gutters class="bg-grey-1 px-9 py-6" justify="center">
      <v-col cols="auto" class="h3 mt-9 mb-6">Helpful Tips</v-col>
      <v-col cols="12">
        <v-row no-gutters justify="center" class="mb-9 pb-6">
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row justify="center">
                <v-col class="h5" cols="auto">TRADE MARKS</v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-img src="@/assets/images/lc-tm-search-icon.png"
                         height="60"
                         width="60"
                         comstrain />
                </v-col>
              </v-row>
              <v-row justify="end">
                <v-col class="text-center small-copy"> Stay away from protected names and trade marks.
                  <br><a href="#">Search Canadian trade marked names</a>
                  <v-icon class="launch-icon">launch</v-icon>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto" class="mx-6">
            <v-container class="square-card">
              <v-row justify="center">
                <v-col class="h5" cols="auto">DOMAIN NAMES</v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-img src="@/assets/images/lc-domain-names-icon.png"
                         height="60"
                         width="60"
                         comstrain />
                </v-col>
              </v-row>
              <v-row>
                <v-col class="text-center small-copy">
                  Before selecting your business name, considering checking available website domain names.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row justify="center">
                <v-col class="h5" cols="auto">SOCIAL MEDIA</v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-img src="@/assets/images/lc-social-media-icon.png"
                         height="60"
                         width="60"
                         comstrain />
                </v-col>
              </v-row>
              <v-row>
                <v-col class="text-center small-copy">
                  Search social media sites to see which usernames may be available for your business.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-9">
      <v-col cols="6" class="pr-9 pl-3 mt-3">
        <v-container class="pa-9">
          <v-row>
            <v-col cols="12" class="h3 info-underline">Need More Information?</v-col>
            <v-col cols="12" class="normal-text">To learn more about BC Names Request Online, please visit
              the BC Government Homepage</v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="6" class="pl-9 pr-3 mt-3">
        <v-container class="pa-9">
          <v-row alinn="start" align-content="start" align-items="start">
            <v-col cols="11" class="h3 info-underline">Contact Us</v-col>
            <v-col cols="12" class="normal-text">
              For support or questions about this application contact us at:
            </v-col>
            <v-col cols="12" class="pb-0">Toll Free: 1-877-526-1526</v-col>
            <v-col cols="12" class="py-0">Phone: 250 952-0568</v-col>
            <v-col cols="12" class="pt-0">Email: SBC_ITOperationsSupport@gov.bc.ca</v-col>
            <v-col cols="12" class="pb-0 bold-text">Hours of Operation</v-col>
            <v-col cols="12" class="pt-0">Monday to Friday, 8:30am - 4:30pm PST</v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <Footer />
 </v-container>
</template>

<script lang="ts">
import ExampleNameGenerator from './example-name-generator'
import Footer from '@/components/lower-info-area/footer'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { ExampleNameGenerator, Footer }
})
export default class LowerContainer extends Vue {
  nameGeneratorWord1: string = 'Lorem'
  nameGeneratorWord2: string = 'Ipsum'
}

</script>

<style lang="sass" scoped>
li
  font-size: 16px

#lower-container
  padding: 0
  margin: 0
  font-size: 16px
  color: $text
  background-color: white

.info-underline
  border-bottom: 1px solid lightgray

.launch-icon
  font-size: 16px
  color: $link
  padding-left: 4px

.square-card
  height: 260px
  width: 260px
  padding: 15px 30px 30px 15px
  border-radius: 4px
  background-color: white
  box-shadow: 2px 2px 4px 0 darkgray

</style>
