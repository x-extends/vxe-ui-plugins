import { h, resolveComponent, ComponentOptions } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'

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
      return h(resolveComponent('el-option'), {
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
        h(resolveComponent(name), {
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
      h(resolveComponent('el-button') as ComponentOptions, {
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

  function createFormItemRadioAndCheckboxRender () {
    return function (renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: any) {
      const { name, options = [], optionProps = {}, attrs } = renderOpts
      const { data, field } = params
      const labelProp = optionProps.label || 'label'
      const valueProp = optionProps.value || 'value'
      const itemValue = XEUtils.get(data, field)
      return [
        h(resolveComponent(`${name}Group`) as ComponentOptions, {
          ...attrs,
          ...getItemProps(renderOpts, params, itemValue),
          ...getItemOns(renderOpts, params)
        }, {
          default: () => {
            return options.map((option, oIndex) => {
              return h(resolveComponent(name) as ComponentOptions, {
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

  /**
 * 检查触发源是否属于目标节点
 */
  function getEventTargetNode (evnt: any, container: HTMLElement, className: string) {
    let targetElem
    let target = evnt.target
    while (target && target.nodeType && target !== document) {
      if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
        targetElem = target
      } else if (target === container) {
        return { flag: className ? !!targetElem : true, container, targetElem: targetElem }
      }
      target = target.parentNode
    }
    return { flag: false }
  }

  /**
 * 事件兼容性处理
 */
  function handleClearEvent (params: VxeGlobalInterceptorHandles.InterceptorClearFilterParams | VxeGlobalInterceptorHandles.InterceptorClearEditParams | VxeGlobalInterceptorHandles.InterceptorClearAreasParams) {
    const { $event } = params
    const bodyElem = document.body
    if (
    // 远程搜索
      getEventTargetNode($event, bodyElem, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode($event, bodyElem, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode($event, bodyElem, 'el-cascader__dropdown').flag ||
    getEventTargetNode($event, bodyElem, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode($event, bodyElem, 'el-time-panel').flag ||
    getEventTargetNode($event, bodyElem, 'el-picker-panel').flag ||
    // 颜色
    getEventTargetNode($event, bodyElem, 'el-color-dropdown').flag
    ) {
      return false
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
            h(resolveComponent('el-select') as ComponentOptions, {
              ...attrs,
              ...props,
              ...ons
            }, {
              default: () => {
                return XEUtils.map(optionGroups, (group, gIndex) => {
                  return h(resolveComponent('el-option-group') as ComponentOptions, {
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
          h(resolveComponent('el-select') as ComponentOptions, {
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
    ElRadio: {
      renderFormItemContent: createFormItemRadioAndCheckboxRender()
    },
    ElCheckbox: {
      renderFormItemContent: createFormItemRadioAndCheckboxRender()
    },
    ElButton: {
      renderFormItemContent: defaultButtonItemRender
    },
    ElButtons: {
      renderFormItemContent: defaultButtonsItemRender
    }
  })

  VxeUI.interceptor.add('event.clearFilter', handleClearEvent)
  VxeUI.interceptor.add('event.clearEdit', handleClearEvent)
  VxeUI.interceptor.add('event.clearAreas', handleClearEvent)
  // 兼容老版本
  VxeUI.interceptor.add('event.clearActived', handleClearEvent)
}
