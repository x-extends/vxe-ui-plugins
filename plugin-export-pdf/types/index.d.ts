import { VxeUIExport } from 'vxe-pc-ui'

export interface VxeUIPluginExportPDFFonts {
  fontName: string;
  fontStyle?: 'normal';
  fontUrl: string;
}

export interface VxeUIPluginExportPDFOptions {
  jsPDF?: any
  fontName?: string;
  fonts?: VxeUIPluginExportPDFFonts[];
  beforeMethod?: Function;
}

/**
 * 基于 Vxe UI 的扩展插件，支持导出 pdf 文件
 */
export declare const VxeUIPluginExportPDF: {
  setConfig(options?: VxeUIPluginExportPDFOptions): void
  install (VxeUI: VxeUIExport, options?: VxeUIPluginExportPDFOptions): void
}

export default VxeUIPluginExportPDF
