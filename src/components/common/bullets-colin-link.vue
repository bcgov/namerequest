<template>
  <v-row id="bullets-colin-link">
    <v-col cols="12" sm="3">
      <v-radio-group v-model="selectedCompanyType" @change="radioButtonChanged(selectedCompanyType)" flat mandatory>
        <v-radio id="named-company-radio"
          class="mb-0 pb-4"
          label="Named Company"
          :value="CompanyType.NAMED_COMPANY"
        />
        <v-radio id="numbered-company-radio"
          label="Numbered Company"
          :value="CompanyType.NUMBERED_COMPANY"
        />
      </v-radio-group>
    </v-col>
    <v-col cols="12" sm="9">
      <div v-if="selectedCompanyType === CompanyType.NAMED_COMPANY">
        <v-row>
          <slot name="name-input-slot">Name Input</slot>
          <template v-if="showDesignation">
            <slot name="designation">Designation</slot>
          </template>
        </v-row>
      </div>
      <div v-else>
        <ul class="bullet-points">
          <li v-for="bulletPoint in bulletPoints" :key="bulletPoint">
            {{ bulletPoint }}
          </li>
        </ul>
        <div class="btn-spacing" v-if="colinButton">
          <v-btn class="px-9" :href="colinLink" target="_blank">
            Go to Corporate Online to Register <v-icon small class="ml-1">mdi-open-in-new</v-icon>
          </v-btn>
        </div>
        <div class="btn-spacing" v-else>
          <v-btn
            class="px-9"
            @click="incorporateNow()"
          >
            Incorporate Now
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CompanyType, EntityType } from '@/enums'
import NameInput from '@/components/new-request/name-input.vue'
import { Navigate } from '@/plugins'
import BusinessServices from '@/services/business.services'
import { BusinessRequest } from '@/interfaces'

@Component({
  components: {
    NameInput
  }
})
export default class BulletsColinLink extends Vue {
  /** The selected business type. */
  @Prop({ default: '' }) readonly businessType!: EntityType

  /** Show Colin Button. */
  @Prop({ default: false }) readonly colinButton!: boolean

  /** Show Designation Dropdown. */
  @Prop({ default: false }) readonly showDesignation!: boolean

  /** Whether user is authenticated. */
  @Getter getIsAuthenticated!: boolean

  // Local properties
  selectedCompanyType: CompanyType = null
  bulletPoints = [
    'Your business name will be the Incorporation Number assinged by the Registry.',
    'You can change your business name at a later date.',
    'It is not possible to request a specific Incorporation Number.'
  ]
  readonly colinLink = sessionStorage.getItem('CORPORATE_ONLINE_URL')

  // For template
  readonly CompanyType = CompanyType

  /**
   * The alternate short names for entity types.
   * Alternate names are used in Entities UIs.
   */
  entityTypeAlternateShort (entityType: string): string {
    if (entityType === 'BC' || entityType === 'CC') return entityType
    if (entityType === 'CR') return 'BEN'
    if (entityType === 'UL') return 'ULC'
    return ''
  }

  /** Navigate to the Entity Dashboard. */
  goToEntityDashboard (businessId: string): void {
    if (businessId) {
      const dashboardUrl = sessionStorage.getItem('DASHBOARD_URL')
      Navigate(`${dashboardUrl}${businessId}`)
    }
  }

  /**
   * If user is authenticated, create draft business and redirect to Dashboard.
   * If user is not authenticated, redirect to login screen then redirect back.
   */
  async incorporateNow () {
    if (this.getIsAuthenticated) {
      try {
        // show spinner since this is a network call
        this.$root.$emit('showSpinner', true)
        const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
        const businessId = await this.createBusiness(accountId)
        this.goToEntityDashboard(businessId)
      } catch (error) {
        this.$root.$emit('showSpinner', false)
        console.error('incorporateNow() = ', error) // eslint-disable-line no-console
        throw new Error('Unable to Incorporate Now')
      }
    } else {
      // persist legal type of incorporate now in session upon authentication via Signin component
      sessionStorage.setItem('LEGAL-TYPE', this.businessType)
      // navigate to BC Registry login page with return parameter
      const registryHomeUrl = sessionStorage.getItem('REGISTRY_HOME_URL')
      const nameRequestUrl = `${window.location.origin}`
      Navigate(`${registryHomeUrl}login?return=${nameRequestUrl}`)
    }
  }

  /**
   * Create a draft business based on selected business type (If applicable).
   * @param accountId Account ID of logged in user.
   */
  async createBusiness (accountId: number): Promise<string> {
    const legalType = this.entityTypeAlternateShort(this.businessType)
    const businessRequest = {
      filing: {
        header: {
          name: 'incorporationApplication',
          accountId: accountId
        },
        business: {
          legalType: legalType
        },
        incorporationApplication: {
          nameRequest: {
            legalType: legalType
          }
        }
      }
    } as BusinessRequest

    const createBusinessResponse =
      await BusinessServices.createBusiness(businessRequest).catch(error => {
        console.error('createBusiness() = ', error) // eslint-disable-line no-console
        throw new Error('Unable to create new Business')
      })

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }

  /** Emit the selected radio button CompanyType enum value. */
  @Emit('radioButtonChange')
  radioButtonChanged (event: CompanyType): CompanyType {
    return event
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
// Radio button group spacing
.v-input--selection-controls {
  padding-top: 0rem;
  margin-top: 0rem;
}

// Remove background color from radio button group
.v-input__slot, .v-input--selection-controls .v-radio {
    background-color: white;
    font-weight: bold;
}

// Line spacing between bullet points
.bullet-points {
  line-height: 2rem;
}

// Font weight + size of button. This is done to stay consistent with "Check this Name" Button.
.v-btn {
  font-weight: bold;
  min-height: 45px;
  padding-left: 4rem;
}

// Button Spacing. This is done to stay consistent with "Check this Name" Button.
.btn-spacing {
  margin-top: 1rem;
  padding-left: 8rem;
}
</style>
