import { CreateElement } from 'vue'
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
    return XEUtils.kebabCase(type)
  }

  function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'value'
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'input'
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

  function renderOptions (h: CreateElement, options: any[], optionProps: VxeGlobalRendererHandles.RenderOptionProps) {
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    return XEUtils.map(options, (item, oIndex) => {
      return h('el-option', {
        key: oIndex,
        props: {
          value: item[valueProp],
          label: item[labelProp],
          disabled: item.disabled
        }
      })
    })
  }

  function cellText (cellValue: any): string[] {
    return [formatText(cellValue)]
  }

  function createFormItemRender (defaultProps?: { [key: string]: any }) {
    return function (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: any) {
      const { data, field } = params
      const { name } = renderOpts
      const { attrs } = renderOpts
      const itemValue = XEUtils.get(data, field)
      return [
        h(name, {
          attrs,
          props: {
            ...getItemProps(renderOpts, params, itemValue, defaultProps)
          },
          on: getItemOns(renderOpts, params)
        })
      ]
    }
  }

  function defaultButtonItemRender (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions, params: any) {
    const { attrs } = renderOpts
    const props = getItemProps(renderOpts, params, null)
    return [
      h('el-button', {
        attrs,
        props: {
          ...props
        },
        on: getOns(renderOpts, params),
        scopedSlots: {
          default: () => cellText(renderOpts.content || props.content)
        }
      })
    ]
  }

  function defaultButtonsItemRender (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions, params: any) {
    const { children } = renderOpts
    if (children) {
      return children.map((childRenderOpts: VxeGlobalRendererHandles.RenderItemContentOptions) => defaultButtonItemRender(h, childRenderOpts, params)[0])
    }
    return []
  }

  /**
   * 已废弃
   * @deprecated
   */
  function createOldFormItemRadioAndCheckboxRender () {
    return function (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: any) {
      const { name, options = [], optionProps = {}, attrs } = renderOpts
      const { data, field } = params
      const labelProp = optionProps.label || 'label'
      const valueProp = optionProps.value || 'value'
      const itemValue = XEUtils.get(data, field)
      return [
        h(`${name}Group`, {
          attrs,
          props: {
            ...getItemProps(renderOpts, params, itemValue)
          },
          on: getItemOns(renderOpts, params),
          scopedSlots: {
            default: () => {
              return options.map((option, oIndex) => {
                return h(name, {
                  key: oIndex,
                  props: {
                    label: option[valueProp],
                    disabled: option.disabled
                  },
                  scopedSlots: {
                    default: () => cellText(option[labelProp])
                  }
                })
              })
            }
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
      renderFormItemContent (h, renderOpts, params) {
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
            h('el-select', {
              attrs,
              props: {
                ...props
              },
              on: ons,
              scopedSlots: {
                default: () => {
                  return XEUtils.map(optionGroups, (group, gIndex) => {
                    return h('el-option-group', {
                      key: gIndex,
                      props: {
                        label: group[groupLabel]
                      },
                      scopedSlots: {
                        default: () => renderOptions(h, group[groupOptions], optionProps)
                      }
                    })
                  })
                }
              }
            })
          ]
        }
        return [
          h('el-select', {
            attrs,
            props: {
              ...props
            },
            on: ons,
            scopedSlots: {
              default: () => renderOptions(h, options, optionProps)
            }
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
      renderFormItemContent (h, renderOpts, params) {
        const { options = [], optionProps = {}, attrs } = renderOpts
        const { data, field } = params
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h('el-radio-group', {
            attrs,
            props: {
              ...getItemProps(renderOpts, params, itemValue)
            },
            on: {
              ...getItemOns(renderOpts, params)
            },
            scopedSlots: {
              default: () => {
                return options.map((option, oIndex) => {
                  return h('el-radio', {
                    key: oIndex,
                    props: {
                      value: option[valueProp],
                      disabled: option.disabled
                    },
                    scopedSlots: {
                      default: () => cellText(option[labelProp])
                    }
                  })
                })
              }
            }
          })
        ]
      }
    },
    ElCheckboxGroup: {
      renderFormItemContent (h, renderOpts, params) {
        const { options = [], optionProps = {}, attrs } = renderOpts
        const { data, field } = params
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h('el-checkbox-group', {
            attrs,
            props: {
              ...getItemProps(renderOpts, params, itemValue)
            },
            on: {
              ...getItemOns(renderOpts, params)
            },
            scopedSlots: {
              default: () => {
                return options.map((option, oIndex) => {
                  return h('el-checkbox', {
                    key: oIndex,
                    props: {
                      value: option[valueProp],
                      label: option[labelProp],
                      disabled: option.disabled
                    }
                  })
                })
              }
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
