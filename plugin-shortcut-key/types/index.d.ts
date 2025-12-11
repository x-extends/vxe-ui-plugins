import { VxeUIExport, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'

export interface ShortcutKeyConf {
  key: string;
  callback: Function
}

export interface ShortcutKeySettingConfig {
  [funcName: string]: string;
}

export interface ShortcutKeyListenerConfig {
  [funcName: string]: (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams, evnt: Event) => any;
}

export interface VxeUIPluginShortcutKeyOptions {
  disabled?: string[] | ShortcutKeyConf[];
  tableListener?: ShortcutKeyListenerConfig;
  setting?: ShortcutKeySettingConfig;
}

/**
 * 基于 Vxe UI 的扩展插件，为键盘操作提供快捷键的设置
 */
export declare const VxeUIPluginShortcutKey: {
  setConfig(options?: VxeUIPluginShortcutKeyOptions): void
  install (VxeUI: VxeUIExport, options?: VxeUIPluginShortcutKeyOptions): void
}

export default VxeUIPluginShortcutKey
