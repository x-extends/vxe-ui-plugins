import { VxeUIExport } from 'vxe-pc-ui'

/**
 * 基于 Vxe UI 的扩展插件，支持导出 pdf 文件
 */
export declare const VxeUIPluginExportPDF: {
  install (VxeUI: VxeUIExport, options?: {
    ExcelJS?: any
  }): void
}

export default VxeUIPluginExportPDF
