import { resolveComponent } from 'vue'
import { globalConfig, componentMaps } from '../store'

export function getCurrComponent (name: string) {
  const comp = componentMaps[name] || (globalConfig.ElementPlus ? globalConfig.ElementPlus[name] : null)
  if (comp) {
    return comp
  }
  return resolveComponent(name)
}
