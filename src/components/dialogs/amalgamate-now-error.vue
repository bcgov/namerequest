<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
  >
    <v-card>
      <v-card-title id="dialog-title">
        Unable to Amalgamate Now
      </v-card-title>

      <v-card-text id="dialog-text">
        <!-- display message -->
        <div class="general-error">
          <p>Unable to amalgamate now. Please cancel or try again.</p>
        </div>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-cancel-button"
          class="dialog-close"
          text
          @click="close()"
        >
          Cancel
        </v-btn>
        <v-btn
          id="dialog-try-again-button"
          class="dialog-close"
          text
          @click="tryAgain()"
        >
          Try Again
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({})
export default class AmalgamateNowErrorDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop() readonly dialog: boolean

  /** Prop to provide attachment selector. */
  @Prop() readonly attach: string

  /** Pass click event to parent. */
  @Emit() close () { }

  /** Try again button clicked. Refresh the page. */
  tryAgain () {
    window.location.reload()
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-dialog {
  margin: 2rem;

  .v-card {
    padding: 0;

    .v-card__title {
      padding: 1.25rem 1.5rem;
      color: $BCgovFontColorInverted;
      background: $BCgovBlue5;
      font-size: $px-18;
      font-weight: bold;
      margin: 0;
    }

    .v-card__text {
      padding: 1.5rem !important;
      font-weight: 300;
      color: $gray7 !important;
      font-size: $px-16;
    }

    .v-card__actions {
      padding: 1rem;
    }
  }
}
</style>
