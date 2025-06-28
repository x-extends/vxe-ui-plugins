import { h, ComponentOptions } from 'vue'
import { getCurrComponent } from '../util/comp'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'

/**
 * 表单 - 渲染器
 */
export function defineFormRender (VxeUI: VxeUIExport) {
  function isEmptyValue (cellValue: any) {
    return cellValue === null || cellValue === undefined || cellValue === ''
  }

  function getOnName (type: string) {
    return 'on' + type.substring(0, 1).toLocaleUpperCase() + type.substring(1)
  }

  function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'modelValue'
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'update:modelValue'
  }

  function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    let type = 'change'
    switch (renderOpts.name) {
      case 'ElAutocomplete':
        type = 'select'
        break
      case 'ElInput':
      case 'ElInputNumber':
        type = 'input'
        break
    }
    return type
  }

  function getItemProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: any, value: any, defaultProps?: { [prop: string]: any }) {
    return XEUtils.assign({}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
  }

  function formatText (cellValue: any) {
    return '' + (isEmptyValue(cellValue) ? '' : cellValue)
  }

  function getOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderParams, inputFunc?: Function, changeFunc?: Function) {
    const { events } = renderOpts
    const modelEvent = getModelEvent(renderOpts)
    const changeEvent = getChangeEvent(renderOpts)
    const isSameEvent = changeEvent === modelEvent
    const ons: { [type: string]: Function } = {}
    XEUtils.objectEach(events, (func: Function, key: string) => {
      ons[getOnName(key)] = function (...args: any[]) {
        func(params, ...args)
      }
    })
    if (inputFunc) {
      ons[getOnName(modelEvent)] = function (targetEvnt: any) {
        inputFunc(targetEvnt)
        if (events && events[modelEvent]) {
          events[modelEvent](params, targetEvnt)
        }
        if (isSameEvent && changeFunc) {
          changeFunc(targetEvnt)
        }
      }
    }
    if (!isSameEvent && changeFunc) {
      ons[getOnName(changeEvent)] = function (...args: any[]) {
        changeFunc(...args)
        if (events && events[changeEvent]) {
          events[changeEvent](params, ...args)
        }
      }
    }
    return ons
  }

  function getItemOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: any) {
    const { $form, data, field } = params
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      XEUtils.set(data, field, value)
    }, () => {
    // 处理 change 事件相关逻辑
      $form.updateStatus(params)
    })
  }

  function renderOptions (options: any[], optionProps: VxeGlobalRendererHandles.RenderOptionProps) {
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    return XEUtils.map(options, (item, oIndex) => {
      return h(getCurrComponent('el-option'), {
        key: oIndex,
        value: item[valueProp],
        label: item[labelProp],
        disabled: item.disabled
      })
    })
  }

  function cellText (cellValue: any): string[] {
    return [formatText(cellValue)]
  }

  function createFormItemRender (defaultProps?: { [key: string]: any }) {
    return function (renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: any) {
      const { data, field } = params
      const { name } = renderOpts
      const { attrs } = renderOpts
      const itemValue = XEUtils.get(data, field)
      return [
        h(getCurrComponent(name), {
          ...attrs,
          ...getItemProps(renderOpts, params, itemValue, defaultProps),
          ...getItemOns(renderOpts, params)
        })
      ]
    }
  }

  function defaultButtonItemRender (renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions, params: any) {
    const { attrs } = renderOpts
    const props = getItemProps(renderOpts, params, null)
    return [
      h(getCurrComponent('el-button') as ComponentOptions, {
        ...attrs,
        ...props,
        ...getOns(renderOpts, params)
      }, {
        default: () => cellText(renderOpts.content || props.content)
      })
    ]
  }

  function defaultButtonsItemRender (renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions, params: any) {
    const { children } = renderOpts
    if (children) {
      return children.map((childRenderOpts: VxeGlobalRendererHandles.RenderItemContentOptions) => defaultButtonItemRender(childRenderOpts, params)[0])
    }
    return []
  }

  /**
   * 已废弃
   * @deprecated
   */
  function createOldFormItemRadioAndCheckboxRender () {
    return function (renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: any) {
      const { name, options = [], optionProps = {}, attrs } = renderOpts
      const { data, field } = params
      const labelProp = optionProps.label || 'label'
      const valueProp = optionProps.value || 'value'
      const itemValue = XEUtils.get(data, field)
      return [
        h(getCurrComponent(`${name}Group`) as ComponentOptions, {
          ...attrs,
          ...getItemProps(renderOpts, params, itemValue),
          ...getItemOns(renderOpts, params)
        }, {
          default: () => {
            return options.map((option, oIndex) => {
              return h(getCurrComponent(name) as ComponentOptions, {
                key: oIndex,
                label: option[valueProp],
                disabled: option.disabled
              }, {
                default: () => cellText(option[labelProp])
              })
            })
          }
        })
      ]
    }
  }

  VxeUI.renderer.mixin({
    ElAutocomplete: {
      renderFormItemContent: createFormItemRender()
    },
    ElInput: {
      renderFormItemContent: createFormItemRender()
    },
    ElInputNumber: {
      renderFormItemContent: createFormItemRender()
    },
    ElSelect: {
      renderFormItemContent (renderOpts, params) {
        const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
        const { data, field } = params
        const { attrs } = renderOpts
        const itemValue = XEUtils.get(data, field)
        const props = getItemProps(renderOpts, params, itemValue)
        const ons = getItemOns(renderOpts, params)
        if (optionGroups) {
          const groupOptions = optionGroupProps.options || 'options'
          const groupLabel = optionGroupProps.label || 'label'
          return [
            h(getCurrComponent('el-select') as ComponentOptions, {
              ...attrs,
              ...props,
              ...ons
            }, {
              default: () => {
                return XEUtils.map(optionGroups, (group, gIndex) => {
                  return h(getCurrComponent('el-option-group') as ComponentOptions, {
                    label: group[groupLabel],
                    key: gIndex
                  }, {
                    default: () => renderOptions(group[groupOptions], optionProps)
                  })
                })
              }
            })
          ]
        }
        return [
          h(getCurrComponent('el-select') as ComponentOptions, {
            ...attrs,
            ...props,
            ...ons
          }, {
            default: () => renderOptions(options, optionProps)
          })
        ]
      }
    },
    ElCascader: {
      renderFormItemContent: createFormItemRender()
    },
    ElDatePicker: {
      renderFormItemContent: createFormItemRender()
    },
    ElTimePicker: {
      renderFormItemContent: createFormItemRender()
    },
    ElTimeSelect: {
      renderFormItemContent: createFormItemRender()
    },
    ElRate: {
      renderFormItemContent: createFormItemRender()
    },
    ElSwitch: {
      renderFormItemContent: createFormItemRender()
    },
    ElSlider: {
      renderFormItemContent: createFormItemRender()
    },
    ElRadioGroup: {
      renderFormItemContent (renderOpts, params) {
        const { options = [], optionProps = {}, attrs } = renderOpts
        const { data, field } = params
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h(getCurrComponent('el-radio-group'), {
            ...attrs,
            ...getItemProps(renderOpts, params, itemValue),
            ...getItemOns(renderOpts, params)
          }, {
            default: () => {
              return options.map((option, oIndex) => {
                return h(getCurrComponent('el-radio'), {
                  key: oIndex,
                  value: option[valueProp],
                  disabled: option.disabled
                }, {
                  default: () => cellText(option[labelProp])
                })
              })
            }
          })
        ]
      }
    },
    ElCheckboxGroup: {
      renderFormItemContent (renderOpts, params) {
        const { options = [], optionProps = {}, attrs } = renderOpts
        const { data, field } = params
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h(getCurrComponent('el-checkbox-group'), {
            ...attrs,
            ...getItemProps(renderOpts, params, itemValue),
            ...getItemOns(renderOpts, params)
          }, {
            default: () => {
              return options.map((option, oIndex) => {
                return h(getCurrComponent('el-checkbox'), {
                  key: oIndex,
                  value: option[valueProp],
                  label: option[labelProp],
                  disabled: option.disabled
                })
              })
            }
          })
        ]
      }
    },
    ElButton: {
      renderFormItemContent: defaultButtonItemRender
    },

    // 已废弃
    ElRadio: {
      renderFormItemContent: createOldFormItemRadioAndCheckboxRender()
    },
    ElCheckbox: {
      renderFormItemContent: createOldFormItemRadioAndCheckboxRender()
    },
    ElButtons: {
      renderFormItemContent: defaultButtonsItemRender
    }
  })
}
