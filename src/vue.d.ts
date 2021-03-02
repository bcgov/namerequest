import { AppConfigI } from '@/interfaces'

declare module 'vue/types/vue' {
  interface Vue extends AppConfigI {}
}
