import { VxeUIExport } from 'vxe-pc-ui'

/**
 * 基于 Vxe UI 的扩展插件，支持导出 xlsx 文件
 */
export declare const VxeUIPluginExportXLSX: {
  install (VxeUI: VxeUIExport, options?: {
    ExcelJS?: any
  }): void
}

export default VxeUIPluginExportXLSX
