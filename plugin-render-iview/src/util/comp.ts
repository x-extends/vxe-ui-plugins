import { componentMaps } from '../store'

export function getCurrComponent (name: string) {
  const comp = componentMaps[name]
  if (comp) {
    return comp
  }
  return 'name'
}
