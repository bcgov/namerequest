<template>
  <v-text-field
    id="name-input-text-field"
    ref="nameInputRef"
    :error-messages="message"
    autocomplete="chrome-off"
    :filled="!isReadOnly"
    :rules="(searchValue && isMrasSearch) ? mrasRules : defaultRules"
    :label="label"
    :class="{ 'read-only-mode': isReadOnly }"
    :disabled="isReadOnly"
    :hint="hint"
    hide-details="auto"
    persistent-hint
    v-model="searchValue"
    @input="setClearErrors()"
    @blur="handleBlur()"
    @keydown.enter="handleSubmit($event)"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { Location, NrRequestActionCodes } from '@/enums'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { sanitizeName } from '@/plugins'
import { MRAS_MAX_LENGTH } from '@/components/new-request/constants'

@Component({})
export default class NameInput extends Vue {
  /** Whether to perform MRAS search. */
  @Prop({ default: false }) readonly isMrasSearch!: boolean
  /** Whether this component is read-only (eg, on name check page). */
  @Prop({ default: false }) readonly isReadOnly!: boolean
  /** Hint to show (eg, on name check page). */
  @Prop({ default: null }) readonly hint!: string

  // Store getters
  @Getter getCorpSearch!: string
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getLocation!: Location
  @Getter getName!: string
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter isMrasJurisdiction!: boolean
  @Getter isXproFlow!: boolean

  // Store actions
  @Action setClearErrors!: () => void
  @Action setCorpSearch!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setMrasSearchInfoModalVisible!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  readonly err_msg = 'Cannot exceed ' + MRAS_MAX_LENGTH + ' characters'

  readonly defaultRules = [
    v => (!v || v.length <= MRAS_MAX_LENGTH) || this.err_msg
  ]

  nameInputComponent = null

  mounted (): void {
    // ref is only valid after component is mounted
    this.nameInputComponent = this.$refs['nameInputRef']
  }

  /** The array of validation rules for the MRAS corp num. */
  get mrasRules (): Function[] {
    return [
      v => (/^[0-9a-zA-Z-]+$/.test(v) || 'A corporate number is required'),
      v => (!v || v.length <= 40) || 'Cannot exceed 40 characters' // maximum character count
    ]
  }

  /** Local validator when input is a MRAS corp num. */
  get isCorpNumValid (): boolean {
    if (this.isMrasSearch) return this.nameInputComponent?.valid || false
    return true
  }

  get label (): string {
    if (this.isReadOnly && (this.isMrasSearch || !this.isXproFlow)) return '' // should never happen

    if (this.isReadOnly && this.isXproFlow) return 'Name in home jurisdiction'

    if (this.isXproFlow) {
      if (this.isMrasJurisdiction && !this.getHasNoCorpNum) {
        return 'Enter the corporate number assigned by the home jurisdiction'
      } else {
        return 'Business\'s full legal name in home jurisdiction'
      }
    }

    return 'Enter a name to request'
  }

  get message (): string[] {
    if (this.getErrors.includes('name')) {
      if (this.isMrasSearch) {
        return ['Please enter a corporation number to search for']
      } else {
        return ['Please enter a name to search for']
      }
    }

    if (this.getErrors.includes('length')) {
      return ['Please enter a longer name']
    }

    if (this.getErrors.includes('mras_length_exceeded')) {
      return [this.err_msg]
    }

    return null
  }

  get searchValue (): string {
    return this.isMrasSearch ? this.getCorpSearch : this.getName
  }

  set searchValue (value: string) {
    this.isMrasSearch ? this.setCorpSearch(value) : this.setName(value)
  }

  handleBlur (): void {
    // The leading and trailing spaces need to be removed when name input finished,
    // using sanitizeName() which has was used in name-capture to do the work.
    this.searchValue = sanitizeName(this.searchValue)
  }

  async handleSubmit (event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isCorpNumValid) {
      event.preventDefault()
      if (this.searchValue) {
        // hide modal and perform name analysis
        this.setMrasSearchInfoModalVisible(false)
        this.$root.$emit('showSpinner', true)
        await this.startAnalyzeName(null)
        this.$root.$emit('showSpinner', false)
      }
      return
    }
    return event
  }

  @Watch('isCorpNumValid')
  @Emit() private emitCorpNumValidity () {
    return this.isCorpNumValid
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

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
