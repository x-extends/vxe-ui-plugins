import { h } from 'vue'
import { getCurrComponent } from '../util/comp'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'
import type { VxeTableDefines, VxeColumnPropTypes } from 'vxe-table'

/**
 * 表格 - 渲染器
 */
export function defineTableRender (VxeUI: VxeUIExport) {
  function getOnName (type: string) {
    return 'on' + type.substring(0, 1).toLocaleUpperCase() + type.substring(1)
  }

  function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'value'
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'update:value'
  }

  function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    const type = 'change'
    return type
  }

  function getCellEditFilterProps (renderOpts: any, params: VxeGlobalRendererHandles.RenderEditParams | VxeGlobalRendererHandles.RenderFilterParams, value: any, defaultProps?: { [prop: string]: any }) {
    return XEUtils.assign({}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
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

  function getEditOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderEditParams) {
    const { $table, row, column } = params
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      XEUtils.set(row, column.field, value)
    }, () => {
    // 处理 change 事件相关逻辑
      $table.updateStatus(params)
    })
  }

  function getFilterOns (renderOpts: any, params: VxeGlobalRendererHandles.RenderFilterParams, option: VxeTableDefines.FilterOption, changeFunc: Function) {
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      option.data = value
    }, changeFunc)
  }

  function createEditRender (defaultProps?: { [key: string]: any }) {
    return function (renderOpts: VxeColumnPropTypes.EditRender & { name: string }, params: VxeGlobalRendererHandles.RenderEditParams) {
      const { row, column } = params
      const { name, attrs } = renderOpts
      const cellValue = XEUtils.get(row, column.field)
      return [
        h(getCurrComponent(name), {
          ...attrs,
          ...getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
          ...getEditOns(renderOpts, params)
        })
      ]
    }
  }

  function createFilterRender (defaultProps?: { [key: string]: any }) {
    return function (renderOpts: VxeColumnPropTypes.FilterRender & { name: string }, params: VxeGlobalRendererHandles.RenderFilterParams) {
      const { column } = params
      const { name, attrs } = renderOpts
      return [
        h('div', {
          class: 'vxe-table--filter-element-wrapper'
        }, column.filters.map((option, oIndex) => {
          const optionValue = option.data
          return h(getCurrComponent(name), {
            key: oIndex,
            ...attrs,
            ...getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
            ...getFilterOns(renderOpts, params, option, () => {
            // 处理 change 事件相关逻辑
              handleConfirmFilter(params, !!option.data, option)
            })
          })
        }))
      ]
    }
  }

  function handleConfirmFilter (params: VxeGlobalRendererHandles.RenderFilterParams, checked: boolean, option: VxeTableDefines.FilterOption) {
    const { $panel } = params
    $panel.changeOption(null, checked, option)
  }

  /**
   * 模糊匹配
   * @param params
   */
  function defaultFuzzyFilterMethod (params: VxeGlobalRendererHandles.FilterMethodParams) {
    const { option, row, column } = params
    const { data } = option
    const cellValue = XEUtils.get(row, column.field)
    return XEUtils.toValueString(cellValue).indexOf(data) > -1
  }

  /**
   * 精确匹配
   * @param params
   */
  function defaultExactFilterMethod (params: VxeGlobalRendererHandles.FilterMethodParams) {
    const { option, row, column } = params
    const { data } = option
    const cellValue = XEUtils.get(row, column.field)
    /* eslint-disable eqeqeq */
    return cellValue === data
  }

  VxeUI.renderer.mixin({
    TAutocomplete: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultExactFilterMethod
    },
    TInput: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultFuzzyFilterMethod
    },
    TInputNumber: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultFuzzyFilterMethod
    }
  })
}
