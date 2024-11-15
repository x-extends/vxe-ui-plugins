import type { VxeUIPluginObject, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'

/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode (evnt: any, container: HTMLElement, className: string) {
  let targetElem
  let target = evnt.target
  while (target && target.nodeType && target !== document) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target
    } else if (target === container) {
      return { flag: className ? !!targetElem : true, container, targetElem: targetElem }
    }
    target = target.parentNode
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

export const VxeUIPluginRenderIView: VxeUIPluginObject = {
  install (VxeUI, options?: {
  }) {
    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[plugin-render-iview 4.x] Version 4.x is required')
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
