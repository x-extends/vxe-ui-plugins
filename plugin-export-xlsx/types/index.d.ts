import { VxeUIExport } from 'vxe-pc-ui'
import ExcelJS from 'exceljs'

declare module 'vxe-pc-ui' {
  export namespace VxeTableDefines {
    export interface ExtortSheetMethodParams {
      workbook: ExcelJS.Workbook;
      worksheet: ExcelJS.Worksheet;
    }
  }
}

/**
 * 基于 Vxe UI 的扩展插件，支持导出 xlsx 文件
 */
export declare const VxeUIPluginExportXLSX: {
  install (VxeUI: VxeUIExport, options?: {
    ExcelJS?: any
  }): void
}

export default VxeUIPluginExportXLSX
