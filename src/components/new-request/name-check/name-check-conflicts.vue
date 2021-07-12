<template>
  <v-data-table :headers="headers"
                fixed
                hide-default-header hide-default-footer
                :items="items"
                item-key="problem"
                single-expand
                :expanded.sync="expanded"
                no-data-text=""
                show-expand>
    <template v-slot:item="{ item, headers, expand, isExpanded }">
      <tr v-if="!item.problem" class="no-hover">
        <v-row class="mb-5 pl-4 py-5 border-top border-bottom" justify="center" no-gutters>
          <v-col cols="auto">
            <b class="copy-bold">{{ item.info }}</b>
          </v-col>
        </v-row>
      </tr>
      <tr v-else-if="item.problem === 'loading'" class="no-hover">
        <v-row class="pl-4 py-5 border-top" no-gutters>
          <v-col cols="auto">
            <v-skeleton-loader type="button"/>
          </v-col>
        </v-row>
      </tr>
      <tr v-else-if="item.info && item.info.includes('error')" class="no-hover">
        <v-row v-if="item.info && item.info.includes('error')" class="conflict-row py-5 px-4 border-top" no-gutters>
          <v-col class="nudge-down" cols="auto">
            <v-icon :color="item.iconColor">{{ item.icon }}</v-icon>
          </v-col>
          <v-col class="table-text pl-3 pt-1" cols="8">
            <span v-html="item.problem"/>
          </v-col>
          <v-col class="pl-5" cols="auto">
            <v-btn @click="retry(item.info)">
              Retry
            </v-btn>
          </v-col>
          <v-col class="pl-3" cols="auto">
            <v-btn class="ignore-btn outlined" outlined @click="clearError(item.info)">
              Ignore
            </v-btn>
          </v-col>
        </v-row>
      </tr>
      <tr v-else :class="isExpanded ? 'no-hover' : ''" :colspan="headers.length" @click="expand(!isExpanded)">
        <v-row no-gutters class="conflict-row py-5 px-4 border-top">
          <v-col cols="9">
            <v-row no-gutters>
              <v-col cols="auto" class="nudge-down">
                <v-icon :color="item.iconColor">{{ item.icon }}</v-icon>
              </v-col>
              <v-col cols="auto" class="table-text pl-3 pt-1">
                <span v-html="item.problem"/>
                <b v-for="(word, index) in item.words" :key=index>
                  <span v-if="index === 0"> {{ word }}</span>
                  <span v-else>, {{ word }}</span>
                </b>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row justify="end" no-gutters>
              <v-col v-if="item.count" cols="auto" class="pt-1">
                <v-chip class="chip-count" :color="item.iconColor" dark>{{ item.count }}</v-chip>
              </v-col>
              <v-col v-if="!isExpanded && item.expandLabel" cols="auto">
                <v-row no-gutters :justify="item.count ? 'center' : 'end'">
                  <v-col class="expand-label" :class="item.count ? 'pl-4' : ''" cols="auto">
                    {{ item.expandLabel.closed }}
                  </v-col>
                  <v-col class="pl-3 pr-5 pt-1" cols="auto">
                    <v-icon class="expand-icon">mdi-chevron-down</v-icon>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-else-if="item.expandLabel" cols="auto">
                <v-row no-gutters :justify="item.count ? 'center' : 'end'">
                  <v-col class="expand-label" :class="item.count ? 'pl-4' : ''" cols="auto">
                    {{ item.expandLabel.open }}
                  </v-col>
                  <v-col class="pl-3 pr-5 pt-1" cols="auto">
                    <v-icon class="expand-icon">mdi-chevron-up</v-icon>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </tr>
    </template>
    <template v-slot:expanded-item="{ item }">
      <v-row no-gutters class="pt-2">
        <v-col class="pa-0">
          <v-row v-if="item.expandedList" no-gutters class="px-15">
            <QuickSearchNames :namesList="item.expandedList"/>
          </v-row>
          <v-row v-if="item.expandedInfo1" no-gutters :class="item.expandedList ? 'pt-7' : ''" class="name-check-info-text pb-5 pl-13">
            <v-col cols="auto">
              <v-icon>mdi-information-outline</v-icon>
            </v-col>
            <v-col class="pl-2" style="max-width: 50rem">
              <div v-if="item.info === 'similarMatch'">
                <v-tooltip top content-class="top-tooltip" transition="fade-transition">
                  <template v-slot:activator="{ on, attrs }">
                    <span class="dotted-underline" v-bind="attrs" v-on="on">Similar names</span>
                  </template>
                  <p class="ma-0">
                    Similar names contain the same, synonymous, or similar looking or sounding words.
                  </p>
                </v-tooltip>
                in different business categories may be approved at the discretion of the
                Business Registry. If you feel your name is unique within your business category,
                or you can
                <v-tooltip top content-class="top-tooltip" transition="fade-transition">
                  <template v-slot:activator="{ on, attrs }">
                    <span class="dotted-underline" v-bind="attrs" v-on="on">obtain consent</span>
                  </template>
                  <p class="ma-0">
                    You may be able to use a similar name if you obtain consent or authorization
                    from the business using the name. If consent is required you will be asked
                    to submit signed consent to the Business Registry as part of the review process.
                  </p>
                </v-tooltip>
                to use the name, you can submit your name for review.
              </div>
              <div v-else-if="item.info === 'exactMatch'">
                <span>{{ item.expandedInfo1 }}</span>
                <p class="ma-0">
                  Consider revising your name unless you can
                  <v-tooltip top content-class="top-tooltip" transition="fade-transition">
                    <template v-slot:activator="{ on, attrs }">
                      <span class="dotted-underline" v-bind="attrs" v-on="on">obtain consent</span>
                    </template>
                    <p class="ma-0">
                      You may be able to use a similar name if you obtain consent or authorization
                      from the business using the name. If consent is required you will be asked
                      to submit signed consent to the Business Registry as part of the review process.
                    </p>
                  </v-tooltip>
                  to use this name.
                </p>
              </div>
              <div v-else v-html="item.expandedInfo1">{{ item.expandedInfo1 }}</div>
              <div v-if="item.expandedInfoBlock1" class="pt-7">
                <p v-for="line, index in item.expandedInfoBlock1" :key="index" class="ma-0" v-html="line">
                  {{ line }}
                </p>
              </div>
              <v-row v-if="item.expandedInfo2" no-gutters class="pt-7">
                <span v-html="item.expandedInfo2">{{ item.expandedInfo2 }}</span>
              </v-row>
              <v-row v-if="item.expandedInfo3" no-gutters class="pt-7">
                <span v-html="item.expandedInfo3">{{ item.expandedInfo3 }}</span>
              </v-row>
              <v-row v-if="item.expandedInfo4" no-gutters class="pt-7">
                <span v-html="item.expandedInfo4">{{ item.expandedInfo4 }}</span>
              </v-row>
              <v-row v-if="['similarMatch', 'exactMatch'].includes(item.info)" no-gutters class="pt-3">
                <v-btn :ripple="false" class="outlined pa-0 tips-btn" @click="item.expandExtraInfo = !item.expandExtraInfo">
                  <span>
                    <span v-if="!item.expandExtraInfo" right>View </span>
                    <span v-else right>Hide </span>
                    tips for how to create a unique name
                  </span>
                </v-btn>
              </v-row>
              <v-row v-if="item.expandExtraInfo" no-gutters class="pt-3">
                <v-col>
                  <v-row no-gutters>
                    <b>Use words that will set your name apart, such as:</b>
                  </v-row>
                  <v-row no-gutters>
                    <ul>
                      <li>a person's full Name</li>
                      <li>a geographical location</li>
                      <li>a coined, made-up word, or</li>
                      <li>an acronym</li>
                    </ul>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'

import QuickSearchNames from '@/components/new-request/name-check/quick-search-names.vue'
import { NameCheckItemIF } from '@/interfaces/name-check-interfaces'

@Component({
  components: { QuickSearchNames }
})
export default class NameCheckConflicts extends Vue {
  @Prop()
  private readonly items: Array<NameCheckItemIF>

  @Emit() private clearError (value: string) { }
  @Emit() private retry (value: string) { }

  private expanded: Array<NameCheckItemIF> = []
  private headers = [
    { text: 'Icon', value: 'icon' },
    { text: 'Problem', value: 'problem' },
    { text: 'Words', value: 'words' },
    { text: '', value: 'data-table-expand' }
  ]

  @Watch('expanded')
  private triggerChange () { }

  @Watch('items')
  private updateExpanded (value: Array<NameCheckItemIF>) {
    if (value && value.length > 0) {
      if (['exactMatch', 'similarMatch'].includes(value[0].info)) {
        this.expanded.push(value[0])
      } else {
        this.expanded = []
      }
    } else {
      this.expanded = []
    }
  }

  mounted () {
    // if (this.items && this.items.length > 0) {
    //   if (['exactMatch', 'similarMatch'].includes(this.items[0].info)) {
    //     this.expanded.push(this.items[0])
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.border-bottom {
  border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
}
.border-top {
  border-top: thin solid rgba(0, 0, 0, 0.12) !important;
}
.chip-count {
  height: 1.25rem;
}
.conflict-row:hover .expand-icon {
  background-color: rgba(61, 140, 204, 1); /* $app-blue */
  color: white;
}
.expand-icon {
  background-color: rgba(33, 150, 243, 0.1); /* $app-blue 0.1 opacity */
  border-radius: 50%;
  color: $app-blue;
}
.expand-label {
  color: $app-blue;
  font-size: 0.875rem;
  padding-top: 7px;
}
.ignore-btn {
  color: $app-red
}
.name-check-info-text {
  color: $gray7;
  font-size: 0.875rem;
  line-height: 1.375rem;
  padding-right: 9rem;
}
.no-hover:hover {
  background-color: transparent !important;
}
.nudge-down {
  padding-top: 2px;
}
.table-text {
  color: $gray7;
  font-size: 1rem;
  line-height: 1.5rem;
}
.v-btn.tips-btn {
  box-shadow: none !important;
  text-decoration: underline;
}
.v-btn.tips-btn:before {
  box-shadow: none !important;
  background-color: transparent !important;
}
::v-deep .v-skeleton-loader__button {
  color: #F1F3F5;
  width: 27rem;
}
</style>