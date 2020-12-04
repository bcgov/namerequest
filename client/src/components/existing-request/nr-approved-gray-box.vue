<template>
  <v-row no-gutters class="bg-light-gray">
    <v-col class="text-body-4 px-5 py-4">
      Your Name Request <b>{{nrNum}}</b> for <b>{{approvedName}}</b> has been approved
      for use. An email has been sent to <b>{{emailAddress}}</b> with instructions
      for how to use your Name Request.
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class NrApprovedGrayBox extends Vue {
  @Prop({ default: 'TBD' })
  readonly nrNum: string

  @Prop({ default: 'TBD' })
  readonly approvedName: string

  @Prop({ default: 'TBD' })
  readonly emailAddress: string
}
</script>
