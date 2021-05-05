<template>
  <div>
    <v-col cols="12" class="mb-4">
      <Stats class="pr-10"/>
    </v-col>
    <v-col cols="12" class="mb-n2">
      <span class="h2 colour-white">Name Request
        <v-tooltip class="test-class"
                   bottom
                   nudge-right="10"
                   nudge-top="5"
                   content-class="bottom-tooltip tooltip-extra-wide"
                   transition="fade-transition"
                   :open-on-hover="false"
        >
          <template v-slot:activator="{ on }">
            <v-btn class="beta-wrapper-btn ml-n2 mb-n2 pa-0"
                   retain-focus-on-click
                   :ripple="false"
                   @click="on.click"
                   @blur="on.blur"
            >
              <sup class="beta-tag">Beta</sup>
            </v-btn>
          </template>
          <p>The Name Request website is available as a Beta version. Name requests obtained through the Name Request
            Beta website are official name requests and can be used in the province of British Columbia.
          </p>
          <p>The Name Request Beta website contains all of the functionality of the previous Name Requests Online site,
            as well as new functionality intended to improve the experience of starting and managing businesses in BC.
            Some features of the site may not function as intended, and if you encounter this please contact us:
          </p>
          <span class="tooltip-bullet">
            <a class="white--text" href="tel:+1-877-370-1033" target="_blank">Toll Free: 1-877-370-1033</a>
          </span>
          <span class="tooltip-bullet">
            <a class="white--text" href="tel:+1-250-370-1033" target="_blank">Victoria Office: 250-370-1033</a>
          </span>
          <span class="tooltip-bullet">
            <a class="white--text" href="mailto:BCRegistries@gov.bc.ca" target="_blank">BCRegistries@gov.bc.ca</a>
          </span>
          <p class="mt-3 mb-0">
            As part of a
            <a class="white--text" :href="agileUrl" target="_blank">modern agile software development process</a>
            the Name Request website will be continually updated and improved based on feedback from citizens and
            businesses in BC.
          </p>
        </v-tooltip>
      </span>
    </v-col>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Stats from '@/components/new-request/stats.vue'

@Component({
  components: {
    Stats
  }
})
export default class AppTitleCols extends Vue {
  @Prop(String)
  readonly id: string

  private agileUrl = 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business' +
    '/permits-licences/news-updates/modernization'
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.colour-white {
  color: white !important;
}

.beta-tag {
  top: -1rem;
  color: $BCgovGold5;
  font-size: 19px;
  font-weight: bold;
  text-transform: uppercase;
  &:hover {
    cursor: pointer;
  }
}
.beta-wrapper-btn {
  background-color: inherit !important;
  box-shadow: unset !important;
  font: inherit !important;
  height: inherit !important;
  &:before {
    background-color: inherit !important;
  }
}
.v-tooltip__content {
  pointer-events: auto !important;
}
.tooltip-extra-wide {
  width: 410px !important;
}
</style>
