import { h } from 'vue'
import { getCurrComponent } from '../util/comp'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'

/**
 * 表单 - 渲染器
 */
export function defineFormRender (VxeUI: VxeUIExport) {
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

  function getItemProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: any, value: any, defaultProps?: { [prop: string]: any }) {
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

  VxeUI.renderer.mixin({
    TAutocomplete: {
      renderFormItemContent: createFormItemRender()
    },
    TInput: {
      renderFormItemContent: createFormItemRender()
    },
    TInputNumber: {
      renderFormItemContent: createFormItemRender()
    }
  })
}
