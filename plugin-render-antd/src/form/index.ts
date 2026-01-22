import { CreateElement } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeFormConstructor, VxeFormPrivateMethods } from 'vxe-pc-ui'

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
    let prop = 'value'
    switch (renderOpts.name) {
      case 'ASwitch':
        prop = 'checked'
        break
    }
    return prop
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    let type = 'change'
    switch (renderOpts.name) {
      case 'AInput':
        type = 'change.value'
        break
      case 'ARadio':
      case 'ACheckbox':
        type = 'input'
        break
    }
    return type
  }

  function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'change'
  }

  function getItemProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams, value: any, defaultProps?: { [prop: string]: any }) {
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

  function getItemOns (renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
    const { $form, data, field } = params
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      XEUtils.set(data, field, value)
    }, () => {
    // 处理 change 事件相关逻辑
      $form.updateStatus(params)
      if (renderOpts.changeToSubmit) {
        ($form as VxeFormConstructor & VxeFormPrivateMethods).handleSubmitEvent(new Event('change'))
      }
    })
  }

  function renderOptions (h: CreateElement, options: any[], optionProps: VxeGlobalRendererHandles.RenderOptionProps) {
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    return XEUtils.map(options, (item, oIndex) => {
      return h('a-select-option', {
        key: oIndex,
        props: {
          value: item[valueProp],
          disabled: item.disabled
        }
      }, item[labelProp])
    })
  }

  function cellText (cellValue: any): string[] {
    return [formatText(cellValue)]
  }

  function createFormItemRender (defaultProps?: { [key: string]: any }) {
    return function (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions & { name: string }, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
      const { data, field } = params
      const { name } = renderOpts
      const { attrs } = renderOpts
      const itemValue = XEUtils.get(data, field)
      return [
        h(name, {
          attrs,
          props: getItemProps(renderOpts, params, itemValue, defaultProps),
          on: getItemOns(renderOpts, params)
        })
      ]
    }
  }

  function defaultButtonItemRender (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
    const { attrs } = renderOpts
    const props = getItemProps(renderOpts, params, null)
    return [
      h('a-button', {
        attrs,
        props,
        on: getItemOns(renderOpts, params),
        scopedSlots: {
          default: () => cellText(renderOpts.content || props.content)
        }
      })
    ]
  }

  function defaultButtonsItemRender (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
    const { children } = renderOpts
    if (children) {
      return children.map((childRenderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions) => defaultButtonItemRender(h, childRenderOpts, params)[0])
    }
    return []
  }

  /**
   *
   * 已废弃
   * @deprecated
   */
  function createOldFormItemRadioAndCheckboxRender () {
    return function (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions & { name: string }, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
      const { name, options = [], optionProps = {} } = renderOpts
      const { data, field } = params
      const { attrs } = renderOpts
      const labelProp = optionProps.label || 'label'
      const valueProp = optionProps.value || 'value'
      const itemValue = XEUtils.get(data, field)
      return [
        h(`${name}Group`, {
          attrs,
          props: getItemProps(renderOpts, params, itemValue),
          on: getItemOns(renderOpts, params),
          scopedSlots: {
            default: () => {
              return options.map((option, oIndex) => {
                return h(name, {
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
  }

  VxeUI.renderer.mixin({
    AAutoComplete: {
      renderFormItemContent: createFormItemRender()
    },
    AInput: {
      renderFormItemContent: createFormItemRender()
    },
    AInputNumber: {
      renderFormItemContent: createFormItemRender()
    },
    ASelect: {
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
            h('a-select', {
              attrs,
              props: {
                ...props,
                options: undefined
              },
              on: ons
            }, XEUtils.map(optionGroups, (group: any, gIndex: any) => {
              return h('a-select-opt-group', {
                key: gIndex
              }, [
                h('span', {
                  slot: 'label'
                }, group[groupLabel])
              ].concat(
                renderOptions(h, group[groupOptions], optionProps)
              ))
            }))
          ]
        }
        return [
          h('a-select', {
            attrs,
            props: {
              ...props,
              options: props.options || options
            },
            on: ons
          })
        ]
      }
    },
    ACascader: {
      renderFormItemContent: createFormItemRender()
    },
    ADatePicker: {
      renderFormItemContent: createFormItemRender()
    },
    AMonthPicker: {
      renderFormItemContent: createFormItemRender()
    },
    ARangePicker: {
      renderFormItemContent: createFormItemRender()
    },
    AWeekPicker: {
      renderFormItemContent: createFormItemRender()
    },
    ATimePicker: {
      renderFormItemContent: createFormItemRender()
    },
    ATreeSelect: {
      renderFormItemContent: createFormItemRender()
    },
    ARate: {
      renderFormItemContent: createFormItemRender()
    },
    ASwitch: {
      renderFormItemContent: createFormItemRender()
    },
    ARadioGroup: {
      renderFormItemContent (h, renderOpts, params) {
        const { options = [], optionProps = {} } = renderOpts
        const { data, field } = params
        const { attrs } = renderOpts
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h('a-radio-group', {
            attrs,
            props: getItemProps(renderOpts, params, itemValue),
            on: getItemOns(renderOpts, params),
            scopedSlots: {
              default: () => {
                return options.map((option, oIndex) => {
                  return h('a-radio', {
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
    ACheckboxGroup: {
      renderFormItemContent (h, renderOpts, params) {
        const { options = [], optionProps = {} } = renderOpts
        const { data, field } = params
        const { attrs } = renderOpts
        const labelProp = optionProps.label || 'label'
        const valueProp = optionProps.value || 'value'
        const itemValue = XEUtils.get(data, field)
        return [
          h('a-checkbox-group', {
            attrs,
            props: getItemProps(renderOpts, params, itemValue),
            on: getItemOns(renderOpts, params),
            scopedSlots: {
              default: () => {
                return options.map((option, oIndex) => {
                  return h('a-checkbox', {
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
    AButton: {
      renderFormItemContent: defaultButtonItemRender
    },

    // 已废弃
    ARadio: {
      renderFormItemContent: createOldFormItemRadioAndCheckboxRender()
    },
    ACheckbox: {
      renderFormItemContent: createOldFormItemRadioAndCheckboxRender()
    },
    AButtons: {
      renderFormItemContent: defaultButtonsItemRender
    }
  })
}
