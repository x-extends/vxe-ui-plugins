import { defineComponent, h, PropType, resolveComponent, ComponentOptions } from 'vue'
import { useWidgetPropDataSource, WidgetDataSourceOptionObjVO } from './use'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeFormComponent, VxeFormItemComponent, VxeSwitchComponent } from 'vxe-pc-ui'

interface WidgetElRadioFormObjVO {
  options: WidgetDataSourceOptionObjVO[]
}

export function createWidgetElRadio (VxeUI: VxeUIExport) {
  const getWidgetElRadioConfig = (params: VxeGlobalRendererHandles.CreateFormDesignWidgetConfigParams): VxeGlobalRendererHandles.CreateFormDesignWidgetConfigObj<WidgetElRadioFormObjVO> => {
    return {
      title: '单选框',
      icon: 'vxe-icon-radio-checked',
      options: {
        options: XEUtils.range(0, 3).map((v, i) => {
          return {
            value: VxeUI.getI18n('vxe.formDesign.widgetProp.dataSource.defValue', [i + 1])
          }
        })
      }
    }
  }

  const WidgetElRadioFormComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewParams<WidgetElRadioFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormComponent = VxeUI.getComponent<VxeFormComponent>('VxeForm')
      const VxeUIFormItemComponent = VxeUI.getComponent<VxeFormItemComponent>('VxeFormItem')
      const VxeUISwitchComponent = VxeUI.getComponent<VxeSwitchComponent>('VxeSwitch')

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
                  return h(resolveComponent('el-input') as ComponentOptions, {
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

  const WidgetElRadioViewComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetElRadioFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormItemComponent = VxeUI.getComponent<VxeFormItemComponent>('VxeFormItem')

      const changeEvent = () => {
        const { renderParams } = props
        const { widget, $formView } = renderParams
        if ($formView) {
          const itemValue = $formView ? $formView.getItemValue(widget) : null
          $formView.updateItemStatus(widget, itemValue)
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
            return h(resolveComponent('el-radio-group') as ComponentOptions, {
              modelValue: $formView ? $formView.getItemValue(widget) : null,
              onChange: changeEvent,
              'onUpdate:modelValue' (val: any) {
                if ($formView) {
                  $formView.setItemValue(widget, val)
                }
              }
            }, {
              default: () => {
                return options.options
                  ? options.options.map((item, index) => {
                    return h(resolveComponent('el-radio') as ComponentOptions, {
                      key: index,
                      value: item.value
                    }, {
                      default () {
                        return `${item.value || ''}`
                      }
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
    getWidgetElRadioConfig,
    WidgetElRadioFormComponent,
    WidgetElRadioViewComponent
  }
}
