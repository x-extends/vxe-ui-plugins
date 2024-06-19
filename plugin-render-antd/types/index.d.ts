import { VxeUIExport } from 'vxe-pc-ui'

/**
 * 基于 Vxe UI 的适配插件，用于兼容 ant-design-vue 组件库
 */
export declare const VxeUIPluginRenderAntd: {
  install (VxeUI: VxeUIExport, options?: {
    Antd?: any
  }): void
}

export default VxeUIPluginRenderAntd
