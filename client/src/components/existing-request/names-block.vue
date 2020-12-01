<template>
  <v-row align="start" class="mx-0 bg-light-gray">
    <v-col class="text-name pa-4">
      <!-- TODO: once NR is reviewed (state != NE), add tooltips to all names -->
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
        <!-- <span v-if="getTooltipText(name) || true">[{{getTooltipText(name)}}]</span> -->
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

  /** Returns the decision text for the specified name, or falsy. */
  private getTooltipText (name): string {
    return (name.state !== NameState.NE) && name.decision_text
  }
}
</script>
