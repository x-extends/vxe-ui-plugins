import { defineComponent, h, PropType, resolveComponent, ComponentOptions } from 'vue'

import type { VxeUIExport, VxeGlobalRendererHandles, VxeFormComponent, VxeFormItemComponent, VxeSwitchComponent } from 'vxe-pc-ui'

interface WidgetElDatePickerFormObjVO {
  placeholder: string
}

export function createWidgetElDatePicker (VxeUI: VxeUIExport) {
  const getWidgetElDatePickerConfig = (params: VxeGlobalRendererHandles.CreateFormDesignWidgetConfigParams): VxeGlobalRendererHandles.CreateFormDesignWidgetConfigObj<WidgetElDatePickerFormObjVO> => {
    return {
      title: '日期',
      icon: 'vxe-icon-input',
      options: {
        placeholder: '请选择'
      }
    }
  }

  const WidgetElDatePickerFormComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetFormViewParams<WidgetElDatePickerFormObjVO>>,
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
                itemRender: { name: 'ElDatePicker' }
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

  const WidgetElDatePickerViewComponent = defineComponent({
    props: {
      renderOpts: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
        default: () => ({})
      },
      renderParams: {
        type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetElDatePickerFormObjVO>>,
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
            return h(resolveComponent('el-date-picker') as ComponentOptions, {
              modelValue: $formView ? $formView.getItemValue(widget) : null,
              placeholder: options.placeholder,
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
    getWidgetElDatePickerConfig,
    WidgetElDatePickerFormComponent,
    WidgetElDatePickerViewComponent
  }
}
