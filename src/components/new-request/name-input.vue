<template>
  <v-col cols="12">
    <v-text-field :error-messages="message"
                  @input="clearErrors()"
                  @keydown.enter="handleSubmit"
                  autocomplete="chrome-off"
                  filled
                  id="name-input-text-field"
                  ref="nameInput"
                  :rules="(searchValue && isMrasSearch) ? mrasRules : []"
                  :label="isReadOnly ? '' : nameLabel"
                  :class="{ 'read-only-mode': isReadOnly }"
                  :disabled="isReadOnly"
                  v-model="searchValue">
      <template v-slot:append v-if="!isReadOnly">
        <v-tooltip bottom
                   content-class="bottom-tooltip search-tooltip"
                   transition="fade-transition"
                   :disabled="!isSearchAgain">
          <template v-slot:activator="scope">
            <v-icon class="name-search-icon"
                    id="name-input-icon"
                    color="primary"
                    v-on="scope.on"
                    :disabled="!isCorpNumValid"
                    @click="startAnalyzeName">mdi-magnify</v-icon>
          </template>
          Search Again
        </v-tooltip>
      </template>
    </v-text-field>
  </v-col>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { Location, RequestCode } from '@/enums'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class NameInput extends Vue {
  // Refs
  $refs!: {
    nameInput: any
  }

  // Global getters
  @Getter getCorpSearch!: string
  @Getter getErrors!: string[]
  @Getter getLocation!: string
  @Getter getName!: string
  @Getter getRequestActionCd!: string
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

  /** The array of validation rules for the MRAS corp num. */
  private get mrasRules (): Function[] {
    return [
      v => (/^\d+$/.test(v) || 'A corporate number is required')
    ]
  }

  /** Local validator when input is a MRAS corp num. */
  private get isCorpNumValid (): boolean {
    return this.isMrasSearch ? this.$refs['nameInput']?.valid : true
  }

  get message () {
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

  get searchValue () {
    return this.isMrasSearch ? this.getCorpSearch : this.getName
  }

  set searchValue (value: string) {
    this.isMrasSearch ? this.setCorpSearch(value) : this.setName(value)
  }

  get nameLabel () {
    if (this.isMrasSearch) return 'Enter the corporate number assigned by the home jurisdiction'
    return this.getLocation && this.getLocation !== Location.BC &&
      this.getRequestActionCd !== RequestCode.MOVE
      ? 'Business\'s full legal name in home jurisdiction'
      : 'Enter a Name'
  }

  clearErrors () {
    this.setClearErrors(null)
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

::v-deep .theme--light.v-input--is-disabled input, .theme--light.v-input--is-disabled textarea {
  color: $gray9 !important;
}
</style>
