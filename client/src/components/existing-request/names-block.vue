<template>
  <!-- TODO: try a v-row with prop "no-gutters" -->
  <v-row align="start" class="mx-0 bg-light-gray">
    <v-col class="text-name pa-4">
      <!-- TODO: once NR is reviewed (state != NE), add tooltips to all names -->

      <!-- <v-tooltip top min-width="390" content-class="top-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-checkbox
                  v-model="noCorpNum"
                  id="corp-num-checkbox"
                  class="copy-small"
                  v-slot:label v-on="on">
            <template>
              <span v-on="on" class="copy-small">I don't have a corporate number</span>
            </template>
          </v-checkbox>
        </template>
        <p>If you don't have or don't know the corporation number of the business, enter the full legal name of the
          business in its home jurisdiction.</p>
        <p>Note: If the home jurisdiction requires a name reservation, you may want to complete a name search in the
          home jurisdiction first to ensure that the name is available and then return to BC</p>
      </v-tooltip> -->

      <div
        v-for="name of names"
        :key="`name-${name.choice}`"
        :class="getClass(name)"
      >
        {{ `${name.choice}. ${name.name}` }}
        <v-icon
          v-if="getIcon(name)"
          class="mt-n1"
          :class="getClass(name)"
        >
          {{ getIcon(name) }}
        </v-icon>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { NameState } from '@/enums'

@Component({})
export default class NamesBlock extends Vue {
  // enums used in the template:
  NameState = NameState

  @Prop({ default: () => [] })
  readonly names: any[]

  private getIcon (name): string {
    switch (name.state) {
      case NameState.APPROVED:
      case NameState.CONDITION: return 'mdi-check'

      case NameState.REJECTED: return 'mdi-close'

      case NameState.NE:
      default: return ''
    }
  }

  private getClass (name): string {
    switch (name.state) {
      case NameState.APPROVED:
      case NameState.CONDITION: return 'approved'

      case NameState.REJECTED: return 'rejected'

      case NameState.NE:
      default: return ''
    }
  }
}
</script>
