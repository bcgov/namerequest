<template>
  <v-container id="name-build-info" class="content-container">
    <v-row no-gutters>
      <v-col cols="auto" sm="12" class="h3" align="center">How to Build Your Name</v-col>
      <v-col cols="12" sm="6" class="my-9">
        <v-card class="my-9 ml-6 mr-0" flat>
          <v-list class="name-build-list">
            <v-list-item-group v-model="itemIndex" color="primary">
              <v-list-item
                      v-for="(item, i) in items"
                      :key="i"
                      class="name-build-list-item"
                      :class="{'name-build-list-item-active': isActiveTab(i)}"
                      :ripple="false"
                      @mouseover="itemIndex = i"
              >
                <v-icon v-if="isActiveTab(i)" color="primary" left>mdi-check-circle</v-icon>
                <v-icon v-else color="primary" left>mdi-check</v-icon>
                <v-list-item-content>
                  <v-list-item-title
                          class="name-build-list-item-title"
                          :class="{'name-build-list-item-active': isActiveTab(i)}"
                          v-html="item.title"
                  >
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-divider class="mt-9 divider" vertical></v-divider>
      <v-col cols="12" sm="5" class="my-9 mr-9 pl-75">
        <component :is="getDisplayedComponent(itemIndex)" :key="itemIndex" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

// Components
import { BusinessDesignation, ConsentWords, ExampleName, UnavailableWords, UniqueNames, UnknownWords }
  from '@/components/lower-info-area/name-build-sub-components'

@Component({
  components: {
    BusinessDesignation,
    ConsentWords,
    ExampleName,
    UnavailableWords,
    UniqueNames,
    UnknownWords
  }
})
export default class NameBuildInfo extends Vue {
  private itemIndex = 0
  private items = [
    {
      title: 'Check the name has the correct components',
      component: ExampleName
    },
    {
      title: 'Check for unavailable words',
      component: UnavailableWords
    },
    {
      title: 'Check for words that have not been used before',
      component: UnknownWords
    },
    {
      title: 'Check for words that require consent',
      component: ConsentWords
    },
    {
      title: 'Check for similar names in the same sector',
      component: UniqueNames
    },
    {
      title: 'Check for appropriate designation',
      component: BusinessDesignation
    }
  ]

  /** Get the corresponding component for display */
  private getDisplayedComponent (index: number) {
    return this.items[index].component
  }

  /** Check if current tab is active */
  private isActiveTab (index: number) {
    return this.itemIndex === index
  }
}

</script>

<style lang="scss" scoped>
@import "@/assets/scss/base.scss";

#name-build-info {
  min-height: 36rem;
  padding-top: 92px;

  .divider {
    max-height: 24rem;
    border-color: $border;
  }

  .name-build-list {
    background-color: #F1F3F5;

    .name-build-list-item {
      border: solid rgba(0, 0, 0, 0.12);
      border-width: 1px 0 0 0;
    }
    .name-build-list-item:last-of-type {
      border: solid rgba(0, 0, 0, 0.12);
      border-width: 1px 0 1px 0;
    }

    .name-build-list-item:before {
      background-color: white;
    }
    .name-build-list-item-title {
      color: $link;
    }
    .name-build-list-item-active {
      color: $gray7;
      font-weight: bold;
      background-color: white;
    }
  }
}
</style>
