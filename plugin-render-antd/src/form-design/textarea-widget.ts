import { defineComponent, h, PropType, resolveComponent, ComponentOptions } from 'vue'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeFormComponent, VxeFormItemComponent, VxeSwitchComponent, VxeInputComponent } from 'vxe-pc-ui'

interface WidgetATextareaFormObjVO {
  placeholder: string
}

export function createWidgetATextarea (VxeUI: VxeUIExport) {
  const getWidgetATextareaConfig = (params: VxeGlobalRendererHandles.CreateFormDesignWidgetConfigParams): VxeGlobalRendererHandles.CreateFormDesignWidgetConfigObj<WidgetATextareaFormObjVO> => {
    return {
      title: '文本域',
      icon: 'vxe-icon-textarea',
      options: {
        placeholder: '请输入'
      }
    }
  }

  const WidgetATextareaFormComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewParams<WidgetATextareaFormObjVO>>,
        default: () => ({})
      }
    },
    emits: [],
    setup (props) {
      const VxeUIFormComponent = VxeUI.getComponent<VxeFormComponent>('VxeForm')
      const VxeUIFormItemComponent = VxeUI.getComponent<VxeFormItemComponent>('VxeFormItem')
      const VxeUISwitchComponent = VxeUI.getComponent<VxeSwitchComponent>('VxeSwitch')
      const VxeUIInputComponent = VxeUI.getComponent<VxeInputComponent>('VxeInput')

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
                  return h(VxeUIInputComponent, {
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

  const WidgetATextareaViewComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetATextareaFormObjVO>>,
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
            return h(resolveComponent('a-textarea') as ComponentOptions, {
              value: $formView ? $formView.getItemValue(widget) : null,
              placeholder: options.placeholder,
              autoSize: {
                minRows: 2,
                maxRows: 4
              },
              onChange: changeEvent,
              'onUpdate:value' (val: any) {
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
    getWidgetATextareaConfig,
    WidgetATextareaFormComponent,
    WidgetATextareaViewComponent
  }
}
