import type { VxeUIPluginObject, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'
import { componentMaps } from './store'
import XEUtils from 'xe-utils'

function getEventTarget (evnt: Event) {
  const target = evnt.target as HTMLElement | null
  if (target && (target as any).shadowRoot && evnt.composed) {
    return evnt.composedPath()[0] as HTMLElement || target
  }
  return target
}

/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode (evnt: any, container: HTMLElement, className: string) {
  let targetElem
  let target = getEventTarget(evnt)
  const rootEl = document.documentElement || document.querySelector('html')
  while (target && target.nodeType && target !== rootEl) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target
    } else if (target === container) {
      return { flag: className ? !!targetElem : true, container, targetElem: targetElem }
    }
    target = target.parentElement
  }
  return { flag: false }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent (params: VxeGlobalInterceptorHandles.InterceptorClearFilterParams | VxeGlobalInterceptorHandles.InterceptorClearEditParams | VxeGlobalInterceptorHandles.InterceptorClearAreasParams) {
  const { $event } = params
  const bodyElem = document.body
  if (
    // 下拉框、日期
    getEventTargetNode($event, bodyElem, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

function toComponentName (name: string) {
  if (name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1)
  }
  return name
}

export const VxeUIPluginRenderIView: VxeUIPluginObject = {
  component (comp: any) {
    if (comp && comp.name) {
      const kcName = XEUtils.kebabCase('el-button')
      const ccName = toComponentName(XEUtils.camelCase('el-button'))
      componentMaps[kcName] = comp
      componentMaps[ccName] = comp
    } else {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] error component.', comp)
    }
  },
  install (VxeUI, options?: {
  }) {
    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    VxeUI.interceptor.add('event.clearFilter', handleClearEvent)
    VxeUI.interceptor.add('event.clearEdit', handleClearEvent)
    VxeUI.interceptor.add('event.clearAreas', handleClearEvent)
    // 兼容老版本
    VxeUI.interceptor.add('event.clearActived', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderIView)
}

export default VxeUIPluginRenderIView
