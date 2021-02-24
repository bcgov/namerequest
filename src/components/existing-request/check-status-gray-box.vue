<template>
  <v-row no-gutters class="bg-light-gray">
    <v-col class="text-body-4 px-5 py-4">
      To check on the status of this Name Request in the future, enter the request
      number <b>{{nrNum}}</b> plus the Applicant's Phone Number or Email Address
      using the Existing Name Request tab on the site.
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class CheckStatusGrayBox extends Vue {
  @Prop({ default: 'TBD' })
  readonly nrNum: string
}
</script>
