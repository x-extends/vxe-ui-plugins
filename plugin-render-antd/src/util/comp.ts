import { resolveComponent } from 'vue'
import { globalConfig, componentMaps } from '../store'

function toCompName (name: string) {
  return name.replace(/^A/, '')
}

export function getCurrComponent (name: string) {
  const comp = resolveComponent(name)
  if (comp) {
    return comp
  }
  const cName = toCompName(name)
  return componentMaps[name] || componentMaps[cName] || (globalConfig.Antd ? globalConfig.Antd[name] || globalConfig.Antd[cName] : null)
}
