import { defineTableRender } from './table'
import { defineFormRender } from './form'
import { defineFormDesignRender } from './form-design'
import { globalConfig, componentMaps } from './store'
import XEUtils from 'xe-utils'

import type { VxeUIPluginRenderElementOptions } from '../types'
import type { VxeUIPluginObject, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'

// eslint-disable-next-line no-unused-vars
let ElementPlus: any

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
    // 远程搜索
    getEventTargetNode($event, bodyElem, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode($event, bodyElem, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode($event, bodyElem, 'el-cascader__dropdown').flag ||
    getEventTargetNode($event, bodyElem, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode($event, bodyElem, 'el-time-panel').flag ||
    getEventTargetNode($event, bodyElem, 'el-picker-panel').flag ||
    // 颜色
    getEventTargetNode($event, bodyElem, 'el-color-dropdown').flag
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

export const VxeUIPluginRenderElement: VxeUIPluginObject = {
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
  install (VxeUI, options?: VxeUIPluginRenderElementOptions) {
    if (options) {
      ElementPlus = options.ElementPlus
      Object.assign(globalConfig, options)
    }

    // 检查版本
    if (VxeUI.checkVersion) {
      const pVersion = 4
      const sVersion = 11
      if (!VxeUI.checkVersion(VxeUI.tableVersion, pVersion, sVersion)) {
        console.error(`[VUE_APP_VXE_PLUGIN_VERSION] ${VxeUI.getI18n('vxe.error.errorVersion', [`vxe-table@${VxeUI.tableVersion || '?'}`, `vxe-table v${pVersion}.${sVersion}+`])} VUE_APP_VXE_PLUGIN_DESCRIBE`)
      }
    } else {
      if (!/^(4)\./.test(VxeUI.uiVersion || VxeUI.tableVersion)) {
        console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
      }
    }

    defineTableRender(VxeUI)
    defineFormRender(VxeUI)
    defineFormDesignRender(VxeUI)

    VxeUI.interceptor.add('event.clearFilter', handleClearEvent)
    VxeUI.interceptor.add('event.clearEdit', handleClearEvent)
    VxeUI.interceptor.add('event.clearAreas', handleClearEvent)
    // 兼容老版本
    VxeUI.interceptor.add('event.clearActived', handleClearEvent)
  }
}

if (typeof window !== 'undefined') {
  if (window.VxeUI && window.VxeUI.use) {
    window.VxeUI.use(VxeUIPluginRenderElement)
  }
  if ((window as any).ElementPlus) {
    globalConfig.ElementPlus = (window as any).ElementPlus
  }
}

export default VxeUIPluginRenderElement
