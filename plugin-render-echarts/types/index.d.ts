import { VxeUIExport } from 'vxe-pc-ui'

/**
 * 基于 Vxe UI 的适配插件，支持在渲染 echarts 图表
 */
export declare const VxeUIPluginRenderEcharts: {
  install (VxeUI: VxeUIExport, options?: {
    echarts?: any
  }): void
}

export default VxeUIPluginRenderEcharts
