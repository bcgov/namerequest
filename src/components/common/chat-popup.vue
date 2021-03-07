<template>
  <div class="button-container">
    <form
      id="webchat"
      target="webchat_window"
      method="post"
      action="https://testchatservices.maximusbc.ca/Home/Chat"
      onSubmit="window.open('about:blank','webchat_window','width=400,height=500');"
    >
      <input
        type="hidden"
        id="3176ba6a-466d-43a1-8902-b97cff16adf4"
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

      <v-tooltip left content-class="left-tooltip" nudge-left="10">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            x-large
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

      <v-tooltip>
        <v-btn x-large outlined class="chat-button" color="bcgovblue" type="submit">
          <v-icon class="mr-2 ml-n2">mdi-forum-outline</v-icon>
          <span class="font-weight-bold">Chat</span>
        </v-btn>

      </v-tooltip>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MainContainer from '@/components/new-request/main-container.vue'

@Component({
  components: {
    MainContainer
  }
})
export default class SuccessTwo extends Vue {}
</script>

<style scoped lang="scss">
  .button-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 999;
  }

  .chat-button {
    margin-bottom: -1px;
    min-height: 50px;
    background-color: #ffffff !important;
  }

  .v-tooltip__content {
    padding: 0.75rem 1rem !important;
    background-color: rgba(0,0,0,0.85) !important;
    line-height: 1.75rem;
    font-size: 0.875rem !important;
  }

  .left-tooltip:after {
    border-left: 8px solid rgba(0,0,0,0.85) !important;
  }
</style>
