import { VxeUIExport } from 'vxe-pc-ui'

export interface VxeUIPluginRenderElementOptions {
  ElementPlus?: any
  /**
   * 前缀 class，默认 'el-'
   */
  prefixCls?: string
}

/**
 * 基于 Vxe UI 的适配插件，用于兼容 element-plus 组件库
 */
export declare const VxeUIPluginRenderElement: {
  component (comp: any): void
  install (VxeUI: VxeUIExport, options?: VxeUIPluginRenderElementOptions): void
}

export default VxeUIPluginRenderElement
