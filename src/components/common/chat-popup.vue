<template>
  <div class="button-container">
    <form
      id="webchat"
      target="webchat_window"
      method="post"
      :action="window['webChatUrl']"
      onSubmit="window.open('about:blank','webchat_window','width=400,height=500');"
    >
      <input
        type="hidden"
        :id="window['webChatId']"
        name="Reason"
        class="form-control"
        value="SBC_WebChat"
      />
      <input
        type="hidden"
        name="UserLanguage"
        value="en"
      />
      <input
        type="hidden"
        name="Parameters[TimeZoneOffset]"
        value="8"
      />

      <v-tooltip top content-class="top-tooltip" nudge-top="5">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :disabled="chatError"
            large
            outlined
            color="bcgovblue"
            elevation="4"
            class="chat-button"
            type="submit"
            v-bind="attrs"
            v-on="on"
            aria-label="Chat with Helpdesk Staff">
            <v-icon class="mr-2 ml-n2">mdi-forum-outline</v-icon>
            <span class="font-weight-bold">Chat</span>
          </v-btn>
        </template>
        <span>Click here to chat live with Helpdesk staff about Name Requests.</span>
      </v-tooltip>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'

@Component({})
export default class ChatPopup extends Vue {
  readonly window = window

  chatStatus = null
  chatError = false

  mounted (): void {
    axios
      .get(window['webChatStatusUrl'])
      .then(response => (this.chatStatus = response.data.status))
      .catch(error => {
        console.error('failed to get webchat status, error =', error) // eslint-disable-line no-console
        this.chatError = true
      })
  }
}
</script>

<style scoped lang="scss">
  .button-container {
    position: fixed;
    bottom: -1px;
    right: 1rem;
    z-index: 999;
  }

  .chat-button {
    margin-bottom: -1px;
    min-height: 40px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    background-color: #ffffff !important;

  }

  .v-tooltip__content {
    padding: 1rem !important;
    background-color: rgba(0,0,0,0.85) !important;
    line-height: 1.75rem;
  }

  .top-tooltip {
    max-width: 12rem;
  }

  .top-tooltip:after {
    border-top: 8px solid rgba(0,0,0,0.85) !important;
  }
</style>
