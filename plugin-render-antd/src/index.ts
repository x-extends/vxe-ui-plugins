import { defineTableRender } from './table'
import { defineFormRender } from './form'

import type { VxeUIPluginObject, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'
import type { VxeUIPluginRenderAntdOptions } from '../types'

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

export const VxeUIPluginRenderAntd: VxeUIPluginObject = {
  install (VxeUI, options?: VxeUIPluginRenderAntdOptions) {
    const pluginOpts = Object.assign({ prefixCls: 'ant-' }, options)

    // 检查版本
    if (!/^(3)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    /**
      * 事件兼容性处理
      */
    const handleClearEvent = (params: VxeGlobalInterceptorHandles.InterceptorClearFilterParams | VxeGlobalInterceptorHandles.InterceptorClearEditParams | VxeGlobalInterceptorHandles.InterceptorClearAreasParams) => {
      const { $event } = params
      const bodyElem = document.body
      const { prefixCls } = pluginOpts
      if (
        // 下拉框
        getEventTargetNode($event, bodyElem, `${prefixCls}select-dropdown`).flag ||
        // 级联
        getEventTargetNode($event, bodyElem, `${prefixCls}cascader-menus`).flag ||
        // 日期
        getEventTargetNode($event, bodyElem, `${prefixCls}picker-dropdown`).flag ||
        getEventTargetNode($event, bodyElem, `${prefixCls}calendar-picker-container`).flag ||
        // 时间选择
        getEventTargetNode($event, bodyElem, `${prefixCls}time-picker-panel`).flag
      ) {
        return false
      }
    }

    defineTableRender(VxeUI)
    defineFormRender(VxeUI)

    VxeUI.interceptor.add('event.clearFilter', handleClearEvent)
    VxeUI.interceptor.add('event.clearEdit', handleClearEvent)
    VxeUI.interceptor.add('event.clearAreas', handleClearEvent)

    // 兼容老版本
    VxeUI.interceptor.add('event.clearActived', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderAntd)
}

export default VxeUIPluginRenderAntd
