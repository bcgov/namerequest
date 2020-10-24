<template>
  <div class="countdown" :class="countdownClass">
    <div class="countdown-number" :style="countdownTextStyle">{{countdownText}}<small><small>s</small></small></div>
    <svg>
      <circle :style="countdownCircleStyle" style="stroke: #003366" r="18" cx="20" cy="20" />
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class CountdownTimerDisplay extends Vue {
  @Prop(String) bgColorString: string | undefined
  @Prop(String) colorString: string | undefined
  @Prop(String) countdownText: string | undefined
  @Prop(String) countdownClass: string | undefined
  @Prop(String) countdownTextStyle: string | undefined
  @Prop(String) countdownCircleStyle: string | undefined
}
</script>

<style lang="scss">
svg {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  transform: rotateY(-180deg) rotateZ(-90deg);
  z-index: 9;
}

svg circle {
  stroke-dasharray: 113px;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  stroke-width: 2px;
  stroke: #003366;
  fill: none;
}

@keyframes countdown {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 113px;
  }
}

.countdown {
  display: inline-block;
  position: relative;
  margin: auto 15px;
  height: 40px;
  width: 40px;
  text-align: center;

  .countdown-number {
    color: #003366;
    display: inline-block;
    line-height: 40px;
    z-index: 10;
    position: relative;
    font-weight: bold;
    font-size: 1rem;
  }

  &.expired {
    .countdown-number {
      color: darkred !important;
      animation: none !important;;
    }

    svg circle {
      stroke: darkred !important;;
    }
  }
}
</style>
