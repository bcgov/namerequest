<template>
  <v-row no-gutters>
    <v-col cols="12" class="pa-0">
      <v-text-field :error-messages="message"
                    @input="clearErrors()"
                    @blur="handleBlur($event)"
                    @keydown.enter="handleSubmit"
                    autocomplete="chrome-off"
                    :filled="!isReadOnly"
                    id="name-input-text-field"
                    ref="nameInput"
                    :rules="(searchValue && isMrasSearch) ? mrasRules : []"
                    :label="label"
                    :class="{ 'read-only-mode': isReadOnly }"
                    :disabled="isReadOnly"
                    :hint="hint"
                    persistent-hint
                    v-model="searchValue">
      </v-text-field>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { Location, RequestCode } from '@/enums'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { sanitizeName } from '@/plugins'

@Component({})
export default class NameInput extends Vue {
  // Refs
  $refs!: {
    nameInput: any
  }

  // Global getters
  @Getter getCorpSearch!: string
  @Getter getErrors!: string[]
  @Getter getLocation!: Location
  @Getter getName!: string
  @Getter getRequestActionCd!: RequestCode
  @Getter getIsXproMras!: boolean

  // Global actions
  @Action setClearErrors!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setMrasSearchInfoModalVisible!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  // Props
  @Prop({ default: false })
  readonly isSearchAgain: boolean

  @Prop({ default: false })
  readonly isMrasSearch: boolean

  @Prop({ default: false })
  readonly isReadOnly: boolean

  @Prop({ default: '' })
  readonly hint: string

  /** The array of validation rules for the MRAS corp num. */
  private get mrasRules (): Function[] {
    return [
      v => (/^\d+$/.test(v) || 'A corporate number is required'),
      v => (!v || v.length <= 40) || 'Cannot exceed 40 characters' // maximum character count
    ]
  }

  /** Local validator when input is a MRAS corp num. */
  private get isCorpNumValid (): boolean {
    return this.isMrasSearch ? this.$refs['nameInput']?.valid : true
  }

  get label (): string {
    if (this.isReadOnly && (this.isMrasSearch || !this.getIsXproMras)) return ''
    if (this.isReadOnly && this.getIsXproMras) return 'Name in home jurisdiction'
    return this.nameLabel
  }

  get message (): string | string[] {
    if (this.isMrasSearch && this.getErrors.includes('name')) {
      return ['Please enter a corporation number to search for']
    }
    if (this.getErrors.includes('length')) {
      return ['Please enter a longer name']
    }
    if (this.getErrors.includes('name')) {
      return ['Please enter a name to search for']
    }
    return ''
  }

  get searchValue (): string {
    return this.isMrasSearch ? this.getCorpSearch : this.getName
  }

  set searchValue (value: string) {
    this.isMrasSearch ? this.setCorpSearch(value) : this.setName(value)
  }

  get nameLabel (): string {
    if (this.isMrasSearch) return 'Enter the corporate number assigned by the home jurisdiction'

    if (
      this.getLocation &&
      (this.getLocation !== Location.BC) &&
      (this.getRequestActionCd !== RequestCode.MVE)
    ) {
      return 'Business\'s full legal name in home jurisdiction'
    }

    return 'Enter a Name'
  }

  clearErrors () {
    this.setClearErrors(null)
  }

  handleBlur (event) {
    let value = sanitizeName(event.target.value)
    this.setName(value)
  }

  async handleSubmit (event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isCorpNumValid) {
      event.preventDefault()
      if (this.searchValue) await this.analyzeName()
      return
    }
    return event
  }

  async analyzeName () {
    this.setMrasSearchInfoModalVisible(false)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', true)
    if (this.searchValue) await this.startAnalyzeName(null)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', false)
  }

  @Watch('isCorpNumValid')
  @Emit() private emitCorpNumValidity () {
    return this.isCorpNumValid
  }
}

</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.search-tooltip {
  max-width: 100px;
  text-align: center;
  padding: 10px !important;
}
::v-deep .read-only-mode .v-input__slot:not(.v-input--checkbox .v-input__slot) {
  background-color: transparent !important;
}
::v-deep .theme--light.v-input--is-disabled input, .theme--light.v-input--is-disabled textarea {
  color: $gray9 !important;
}
</style>
