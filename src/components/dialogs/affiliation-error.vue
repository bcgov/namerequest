<template>
  <v-dialog v-model="getAffiliationErrorModalVisible" max-width="60%" persistent>
    <v-card class="notify-dialog">
      <v-card-title class="flex-column">
        <v-icon large color="error" class="my-4">mdi-alert</v-icon>
        <span>Error Affiliating Name Request</span>
      </v-card-title>

      <v-card-text class="text-center">
        The specified name request may already be affiliated. Go to
        <a :href="businessRegistryUrl">your Business Registry</a>
        to use the name request.
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn large color="error" @click="setAffiliationErrorModalVisible(false)">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class AffiliationErrorDialog extends Vue {
  @Getter getAffiliationErrorModalVisible!: boolean
  @Action setAffiliationErrorModalVisible!: ActionBindingIF

  get businessRegistryUrl (): string {
    const businessesUrl = sessionStorage.getItem('BUSINESSES_URL')
    // NB: fall back is user's default account
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT')).id || 0
    return `${businessesUrl}account/${accountId}/business`
  }
}
</script>
