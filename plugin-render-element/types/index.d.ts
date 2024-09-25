import { VxeUIExport } from 'vxe-pc-ui'

/**
 * 基于 Vxe UI 的适配插件，用于兼容 element-ui 组件库
 */
export declare const VxeUIPluginRenderElement: {
  install (VxeUI: VxeUIExport, options?: {
    ElementPlus?: any
  }): void
}

export default VxeUIPluginRenderElement
