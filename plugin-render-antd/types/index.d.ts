import type { Component } from 'vue'

import { VxeUIExport } from 'vxe-pc-ui'

export type ComponentProvider = (name: string) => Component | string | undefined

/**
 * 基于 Vxe UI 的适配插件，用于兼容 ant-design-vue 组件库
 */
export declare const VxeUIPluginRenderAntd: {
  install (VxeUI: VxeUIExport, options?: {
    Antd?: any,
    componentProvider?: ComponentProvider;
  }): void
}

export default VxeUIPluginRenderAntd
