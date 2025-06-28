import { resolveComponent } from 'vue'
import { globalConfig, componentMaps } from '../store'

export function getCurrComponent (name: string) {
  return resolveComponent(name) || componentMaps[name] || (globalConfig.ElementPlus ? globalConfig.ElementPlus[name] : null)
}
