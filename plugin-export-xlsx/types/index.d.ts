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

declare module 'vxe-table' {
  export namespace VxeTableDefines {
    export interface ExtortSheetMethodParams {
      workbook: ExcelJS.Workbook;
      worksheet: ExcelJS.Worksheet;
    }
    export interface ColumnInfo {
      _row: any;
      _colSpan: number;
      _rowSpan: number;
      childNodes: VxeTableDefines.ColumnInfo[];
    }
  }
}

export interface VxeUIPluginExportXLSXOptions {
  ExcelJS?: any
}

/**
 * 基于 Vxe UI 的扩展插件，支持导出 xlsx 文件
 */
export declare const VxeUIPluginExportXLSX: {
  setConfig(options?: VxeUIPluginExportXLSXOptions): void
  install (VxeUI: VxeUIExport, options?: VxeUIPluginExportXLSXOptions): void
}

export default VxeUIPluginExportXLSX
