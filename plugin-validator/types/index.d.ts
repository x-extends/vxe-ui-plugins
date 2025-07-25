import { VxeUIExport } from 'vxe-pc-ui'

export interface VxeUIPluginValidatorOptionCustomRegExp {
  mobile?: RegExp
  email?: RegExp
  identityCard?: RegExp
  ip?: RegExp
  url?: RegExp
  plateNumber?: RegExp
}

export interface VxeUIPluginValidatorOptions {
  customRegExp?: VxeUIPluginValidatorOptionCustomRegExp
}

/**
 * Vxe UI 的扩展插件，提供常用的校验配置
 */
export declare const VxeUIPluginValidator: {
  install (VxeUI: VxeUIExport, options?: VxeUIPluginValidatorOptions): void
}

export default VxeUIPluginValidator
