<template>
  <v-col cols="12">
    <v-text-field :error-messages="message"
                  @input="clearErrors()"
                  @keydown.enter="handleSubmit"
                  autocomplete="off"
                  filled
                  id="name-input-text-field"
                  ref="nameInput"
                  :rules="isMrasSearch ? mrasRules : []"
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
import newReqModule from '@/store/new-request-module'
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { Location, RequestCode } from '@/enums'

@Component({})
export default class NameInput extends Vue {
  // Refs
  $refs!: {
    nameInput: any
  }
  /** Local Properties */
  @Prop({ default: false }) isSearchAgain: boolean
  @Prop({ default: false }) isMrasSearch: boolean
  @Prop({ default: false }) isReadOnly: boolean

  /** The array of validation rules for the MRAS corp num. */
  private get mrasRules (): Array<Function> {
    return [
      v => (/^\d+$/.test(v) || 'A corporate number is required')
    ]
  }

  /** Local validator when input is a MRAS corp num. */
  private get isCorpNumValid (): boolean {
    return this.isMrasSearch ? this.$refs['nameInput'].valid : true
  }

  get name () {
    return newReqModule.name
  }

  get errors () {
    return newReqModule.errors
  }
  get message () {
    if (this.isMrasSearch && this.errors.includes('name')) {
      return ['Please enter a corporation number to search for']
    }
    if (this.errors.includes('length')) {
      return ['Please enter a longer name']
    }
    if (this.errors.includes('name')) {
      return ['Please enter a name to search for']
    }
    return ''
  }
  get searchValue () {
    return this.isMrasSearch ? newReqModule.corpSearch : newReqModule.name
  }
  set searchValue (value: string) {
    this.isMrasSearch ? newReqModule.mutateCorpSearch(value) : newReqModule.mutateName(value)
  }
  get nameLabel () {
    if (this.isMrasSearch) return 'Enter the corporate number assigned by the home jurisdiction'
    return newReqModule.location !== Location.BC && newReqModule.request_action_cd !== RequestCode.MOVE
      ? 'Business\'s full legal name in home jurisdiction'
      : 'Enter a Name'
  }
  clearErrors () {
    newReqModule.clearErrors()
  }
  handleSubmit (event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isCorpNumValid) {
      event.preventDefault()
      if (this.name) this.startAnalyzeName()
      return
    }
    return event
  }
  async startAnalyzeName () {
    newReqModule.mutateMrasSearchInfoModalVisible(false)
    if (newReqModule.isXproMras) this.$root.$emit('showSpinner', true)
    if (this.name) await newReqModule.startAnalyzeName()
    if (newReqModule.isXproMras) this.$root.$emit('showSpinner', false)
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
