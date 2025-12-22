import { resolveComponent } from 'vue'
import { globalConfig, componentMaps } from '../store'
import type { VxeGlobalRendererHandles } from 'vxe-table'

export function getCurrComponent (name: string) {
  const comp = componentMaps[name] || (globalConfig.ElementPlus ? globalConfig.ElementPlus[name] : null)
  if (comp) {
    return comp
  }
  return resolveComponent(name)
}

export function hasInputType (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
  switch (renderOpts.name) {
    case 'ElInput':
    case 'ElInputNumber':
    case 'ElTextarea':
      return true
  }
  return false
}
