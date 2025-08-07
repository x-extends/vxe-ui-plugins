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
    // 日期
    getEventTargetNode($event, bodyElem, 'arco-picker-panel-wrapper').flag ||
    // 树选择
    getEventTargetNode($event, bodyElem, 'arco-trigger-popup-wrapper').flag ||
    // 下拉
    getEventTargetNode($event, bodyElem, 'arco-select-dropdown').flag ||
    // 级联
    getEventTargetNode($event, bodyElem, 'arco-cascader-dropdown-panel').flag ||
    // 时间
    getEventTargetNode($event, bodyElem, 'arco-timepicker-container').flag ||
    // 颜色
    getEventTargetNode($event, bodyElem, 'arco-color-picker-panel').flag
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

export const VxeUIPluginRenderArco: VxeUIPluginObject = {
  component (comp: any) {
    if (comp && comp.name) {
      const kcName = XEUtils.kebabCase(comp.name)
      const ccName = toComponentName(XEUtils.camelCase(comp.name))
      componentMaps[kcName] = comp
      componentMaps[ccName] = comp
    } else {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] error component.', comp)
    }
  },
  install (VxeUI, options?: {
  }) {
    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion || VxeUI.tableVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    VxeUI.interceptor.add('event.clearFilter', handleClearEvent)
    VxeUI.interceptor.add('event.clearEdit', handleClearEvent)
    VxeUI.interceptor.add('event.clearAreas', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderArco)
}

export default VxeUIPluginRenderArco
