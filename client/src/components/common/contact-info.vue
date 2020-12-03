<template>
  <div class="contact-info d-flex flex-row">
    <div class="contact-container">
      <v-icon class="contact-icon">mdi-phone</v-icon>
      <span class="contact-key">Canada and U.S. Toll Free:</span>
      <a href="tel:+1-877-370-1033" class="contact-value">1-877-370-1033</a>
    </div>
    <div class="contact-container">
      <v-icon class="contact-icon">mdi-phone</v-icon>
      <span class="contact-key">Victoria Office:</span>
      <a href="tel:+1-250-370-1033" class="contact-value">250-370-1033</a>
    </div>
    <div class="contact-container">
      <v-icon class="contact-icon">mdi-email</v-icon>
      <span class="contact-key">BC Registries Email:</span>
      <a href="mailto:BCRegistries@gov.bc.ca" class="contact-value">BCRegistries@gov.bc.ca</a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ContactInfo extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";

li {
  font-size: 0.9rem;
}

.contact-container {
  display: flex;

  .contact-icon {
    flex: 0 0 1.375rem;
    justify-content: flex-start;
    font-size: 1rem;
    color: $dk-text;
  }

  .contact-key {
    width: 12rem;
  }

  .contact-value {
    flex: 1 1;
  }
}
</style>
