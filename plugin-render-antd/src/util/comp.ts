import { resolveComponent } from 'vue'
import { globalConfig, componentMaps } from '../store'

function toCompName (name: string) {
  return name.replace(/^A/, '')
}

export function getCurrComponent (name: string) {
  const cName = toCompName(name)
  const comp = componentMaps[name] || componentMaps[cName] || (globalConfig.Antd ? (globalConfig.Antd[name] || globalConfig.Antd[cName]) : null)
  if (comp) {
    return comp
  }
  return resolveComponent(name)
}
