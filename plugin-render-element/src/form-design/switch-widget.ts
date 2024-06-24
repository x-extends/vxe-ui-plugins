import { defineComponent, h, PropType, resolveComponent, ComponentOptions } from 'vue'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeFormComponent, VxeFormItemComponent, VxeSwitchComponent } from 'vxe-pc-ui'

interface WidgetElSwitchFormObjVO {
}

export function createWidgetElSwitch (VxeUI: VxeUIExport) {
  const getWidgetElSwitchConfig = (params: VxeGlobalRendererHandles.CreateFormDesignWidgetConfigParams): VxeGlobalRendererHandles.CreateFormDesignWidgetConfigObj<WidgetElSwitchFormObjVO> => {
    return {
      title: '是/否',
      icon: 'vxe-icon-switch',
      options: {
      }
    }
  }

  const WidgetElSwitchFormComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewParams<WidgetElSwitchFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormComponent = VxeUI.getComponent<VxeFormComponent>('VxeForm')
      const VxeUIFormItemComponent = VxeUI.getComponent<VxeFormItemComponent>('VxeFormItem')
      const VxeUISwitchComponent = VxeUI.getComponent<VxeSwitchComponent>('VxeSwitch')

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
              })
            ]
          }
        })
      }
    }
  })

  const WidgetElSwitchViewComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetElSwitchFormObjVO>>,
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

        return h(VxeUIFormItemComponent, {
          class: ['vxe-form-design--widget-render-form-item'],
          field: widget.field,
          title: widget.title
        }, {
          default () {
            return h(resolveComponent('el-switch') as ComponentOptions, {
              modelValue: $formView ? $formView.getItemValue(widget) : null,
              onChange: changeEvent,
              'onUpdate:modelValue' (val: any) {
                if ($formView) {
                  $formView.setItemValue(widget, val)
                }
              }
            })
          }
        })
      }
    }
  })

  return {
    getWidgetElSwitchConfig,
    WidgetElSwitchFormComponent,
    WidgetElSwitchViewComponent
  }
}
