import { defineComponent, h, PropType, ComponentOptions } from 'vue'
import { useWidgetPropDataSource, WidgetDataSourceOptionObjVO } from './use'
import { getCurrComponent } from '../util/comp'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'

interface WidgetElSelectFormObjVO {
  placeholder: string
  options: WidgetDataSourceOptionObjVO[]
}

export function createWidgetElSelect (VxeUI: VxeUIExport) {
  const getWidgetElSelectConfig = (params: VxeGlobalRendererHandles.CreateFormDesignWidgetConfigParams): VxeGlobalRendererHandles.CreateFormDesignWidgetConfigObj<WidgetElSelectFormObjVO> => {
    return {
      title: '下拉框',
      icon: 'vxe-icon-select',
      options: {
        placeholder: '请选择',
        options: XEUtils.range(0, 3).map((v, i) => {
          return {
            value: VxeUI.getI18n('vxe.formDesign.widgetProp.dataSource.defValue', [i + 1])
          }
        })
      }
    }
  }

  const WidgetElSelectFormComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewParams<WidgetElSelectFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormComponent = VxeUI.getComponent('VxeForm')
      const VxeUIFormItemComponent = VxeUI.getComponent('VxeFormItem')
      const VxeUISwitchComponent = VxeUI.getComponent('VxeSwitch')

      const { renderDataSourceFormItem } = useWidgetPropDataSource(VxeUI, props, false)

      return () => {
        const { renderParams } = props
        const { widget } = renderParams

        return h(VxeUIFormComponent, {
          class: 'vxe-form-design--widget-render-form-wrapper',
          vertical: true,
          span: 24,
          titleBold: true,
          titleOverflow: true,
          data: widget.options
        }, {
          default () {
            return [
              h(VxeUIFormItemComponent, {
                title: VxeUI.getI18n('vxe.formDesign.widgetProp.name')
              }, {
                default () {
                  return h(getCurrComponent('el-input') as ComponentOptions, {
                    modelValue: widget.title,
                    'onUpdate:modelValue' (val: any) {
                      widget.title = val
                    }
                  })
                }
              }),
              h(VxeUIFormItemComponent, {
                title: VxeUI.getI18n('vxe.formDesign.widgetProp.placeholder'),
                field: 'placeholder',
                itemRender: { name: 'ElInput' }
              }),
              h(VxeUIFormItemComponent, {
                title: VxeUI.getI18n('vxe.formDesign.widgetProp.required')
              }, {
                default () {
                  return h(VxeUISwitchComponent, {
                    modelValue: widget.required,
                    'onUpdate:modelValue' (val: any) {
                      widget.required = val
                    }
                  })
                }
              }),
              renderDataSourceFormItem()
            ]
          }
        })
      }
    }
  })

  const WidgetElSelectViewComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetElSelectFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormItemComponent = VxeUI.getComponent('VxeFormItem')

      const changeEvent = () => {
        const { renderParams } = props
        const { widget, $formView } = renderParams
        if ($formView) {
          const itemValue = $formView ? $formView.getItemValue(widget) : null
          $formView.updateWidgetStatus(widget, itemValue)
        }
      }

      return () => {
        const { renderParams } = props
        const { widget, $formView } = renderParams
        const { options } = widget

        return h(VxeUIFormItemComponent, {
          class: ['vxe-form-design--widget-render-form-item'],
          field: widget.field,
          title: widget.title
        }, {
          default () {
            return h(getCurrComponent('el-select') as ComponentOptions, {
              modelValue: $formView ? $formView.getItemValue(widget) : null,
              placeholder: options.placeholder,
              onChange: changeEvent,
              'onUpdate:modelValue' (val: any) {
                if ($formView) {
                  $formView.setItemValue(widget, val)
                }
              }
            }, {
              default: () => {
                return options.options
                  ? options.options.map(item => {
                    return h(getCurrComponent('el-option') as ComponentOptions, {
                      label: item.value,
                      value: item.value
                    })
                  })
                  : []
              }
            })
          }
        })
      }
    }
  })

  return {
    getWidgetElSelectConfig,
    WidgetElSelectFormComponent,
    WidgetElSelectViewComponent
  }
}
