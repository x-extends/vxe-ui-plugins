import { VxeUIExport } from 'vxe-pc-ui'

export interface VxeUIPluginMenuOptions {
  copy?: (content: string | number) => boolean;
}

/**
 * 基于 Vxe UI 的扩展插件，支持右键菜单
 */
export declare const VxeUIPluginMenu: {
  install (VxeUI: VxeUIExport, options?: VxeUIPluginMenuOptions): void
}

export default VxeUIPluginMenu
