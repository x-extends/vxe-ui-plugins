import { resolveComponent } from 'vue'
import { componentMaps } from '../store'

export function getCurrComponent (name: string) {
  return componentMaps[name] || resolveComponent(name)
}
