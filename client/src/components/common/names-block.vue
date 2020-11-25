<template>
  <v-row align="start" class="mx-0 bg-light-gray">
    <v-col class="text-name pa-4">
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
        <a
          href="#"
          class="link-sm ml-1"
          v-if="name.state === NameState.CONDITION"
          @click.prevent="onConditionsClicked()"
        >Conditions</a>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
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

  @Emit('conditionsClicked')
  private onConditionsClicked (): void {}
}
</script>
