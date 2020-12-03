<template>
  <!-- TODO: try a v-row with prop "no-gutters" -->
  <v-row align="start" class="mx-0 bg-light-gray">
    <v-col class="text-body-4 px-5 py-4">
      Your Name Request <b>{{nrNum}}</b> has not been approved for use. Please contact
      BC Registry staff to obtain an assumed name for an extraprovincial business:
      <contact-info />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ContactInfo from '@/components/common/contact-info.vue'

@Component({
  components: { ContactInfo }
})
export default class NrNotApprovedGrayBox extends Vue {
  @Prop({ default: 'TBD' })
  readonly nrNum: string

  @Prop({ default: 'TBD' })
  readonly approvedName: string

  @Prop({ default: 'TBD' })
  readonly emailAddress: string
}
</script>
