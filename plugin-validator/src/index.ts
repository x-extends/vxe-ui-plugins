import type { VxeUIExport, VxeFormDefines } from 'vxe-pc-ui'
import type { VxeTableDefines, VxeGlobalValidatorsHandles } from 'vxe-table'

let VxeUI: VxeUIExport

const reMobile = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/
const reEmail = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/
const reIdentityCard = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
const reIp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const reUrl = /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\w.-]*)*\/?$/
const rePlateNumber = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/

function createValidRule (checkMethod: (value: any, rule: VxeTableDefines.ValidatorRule | VxeFormDefines.FormRule) => any) {
  const validOpts: VxeGlobalValidatorsHandles.ValidatorsOptions = {
    tableCellValidatorMethod ({ cellValue, rule }) {
      return checkMethod(cellValue, rule)
    },
    formItemValidatorMethod ({ itemValue, rule }) {
      return checkMethod(itemValue, rule)
    }
  }
  return validOpts
}

/**
 * Vxe UI 的扩展插件，提供常用的校验配置
 */
export const VxeUIPluginValidator = {
  install (core: VxeUIExport) {
    VxeUI = core

    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    VxeUI.validators.mixin({
      // 手机号码，11位
      MOBILE_NUMBER: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!reMobile.test(value)) {
            return new Error('请输入正确的手机号')
          }
        }
      }),
      // 邮箱
      EMAIL_ADDRESS: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!reEmail.test(value)) {
            return new Error('请输入正确的邮箱账号')
          }
        }
      }),
      // 身份证号码
      IDENTITY_CARD: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!reIdentityCard.test(value)) {
            return new Error('请输入正确的身份证号')
          }
        }
      }),
      // IP地址
      IP_ADDRESS: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!reIp.test(value)) {
            return new Error('请输入正确的IP地址')
          }
        }
      }),
      // URL
      URL: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!reUrl.test(value)) {
            return new Error('请输入正确的URL地址')
          }
        }
      }),
      // 车牌号
      PLATE_NUMBER: createValidRule((value, rule) => {
        if (rule.required || value) {
          if (!rePlateNumber.test(value)) {
            return new Error('请输入正确的车牌号')
          }
        }
      })
    })
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginValidator)
}

export default VxeUIPluginValidator
