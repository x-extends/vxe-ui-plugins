import { resolveComponent } from 'vue'
import { componentMaps } from '../store'

function toCompName (name: string) {
  return name.replace(/^A/, '')
}

export function getCurrComponent (name: string) {
  const cName = toCompName(name)
  const comp = componentMaps[name] || componentMaps[cName]
  if (comp) {
    return comp
  }
  return resolveComponent(name)
}
