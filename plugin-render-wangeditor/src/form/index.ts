import { CreateElement } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'

/**
 * 表单 - 渲染器
 */
export function defineFormRender (VxeUI: VxeUIExport, WangEditorComponent: any) {
  function getOnName (type: string) {
    return XEUtils.kebabCase(type)
  }

  function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'value'
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'modelValue'
  }

  function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'change'
  }

  function getItemProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams, value: any, defaultProps?: { [prop: string]: any }) {
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

  function getItemOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
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
    return function (h: CreateElement, renderOpts: VxeGlobalRendererHandles.RenderItemContentOptions & { name: string }, params: VxeGlobalRendererHandles.RenderFormItemContentParams) {
      const { data, field } = params
      const { attrs } = renderOpts
      const itemValue = XEUtils.get(data, field)
      return [
        h(WangEditorComponent, {
          attrs,
          props: getItemProps(renderOpts, params, itemValue, defaultProps),
          on: getItemOns(renderOpts, params)
        })
      ]
    }
  }

  VxeUI.renderer.mixin({
    WangEditor: {
      renderFormItemContent: createFormItemRender()
    }
  })
}
