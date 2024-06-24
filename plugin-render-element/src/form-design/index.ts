import { h } from 'vue'
import { createWidgetElInput } from './input-widget'
import { createWidgetElTextarea } from './textarea-widget'
import { createWidgetElInputNumber } from './number-input-widget'
import { createWidgetElDatePicker } from './date-picker-widget'
import { createWidgetElSelect } from './select-widget'
import { createWidgetElRadio } from './radio-widget'
import { createWidgetElCheckbox } from './checkbox-widget'
import { createWidgetElSwitch } from './switch-widget'

import type { VxeUIExport } from 'vxe-pc-ui'

/**
 * 表单设计器 - 渲染器
 */
export function defineFormDesignRender (VxeUI: VxeUIExport) {
  const { getWidgetElInputConfig, WidgetElInputViewComponent, WidgetElInputFormComponent } = createWidgetElInput(VxeUI)
  const { getWidgetElTextareaConfig, WidgetElTextareaViewComponent, WidgetElTextareaFormComponent } = createWidgetElTextarea(VxeUI)
  const { getWidgetElInputNumberConfig, WidgetElInputNumberViewComponent, WidgetElInputNumberFormComponent } = createWidgetElInputNumber(VxeUI)
  const { getWidgetElDatePickerConfig, WidgetElDatePickerViewComponent, WidgetElDatePickerFormComponent } = createWidgetElDatePicker(VxeUI)
  const { getWidgetElSelectConfig, WidgetElSelectViewComponent, WidgetElSelectFormComponent } = createWidgetElSelect(VxeUI)
  const { getWidgetElRadioConfig, WidgetElRadioViewComponent, WidgetElRadioFormComponent } = createWidgetElRadio(VxeUI)
  const { getWidgetElCheckboxConfig, WidgetElCheckboxViewComponent, WidgetElCheckboxFormComponent } = createWidgetElCheckbox(VxeUI)
  const { getWidgetElSwitchConfig, WidgetElSwitchViewComponent, WidgetElSwitchFormComponent } = createWidgetElSwitch(VxeUI)

  VxeUI.renderer.mixin({
    ElInputWidget: {
      createFormDesignWidgetConfig: getWidgetElInputConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElInputViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElInputFormComponent, { renderOpts, renderParams })
      }
    },
    ElTextareaWidget: {
      createFormDesignWidgetConfig: getWidgetElTextareaConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElTextareaViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElTextareaFormComponent, { renderOpts, renderParams })
      }
    },
    ElNumberInputWidget: {
      createFormDesignWidgetConfig: getWidgetElInputNumberConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElInputNumberViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElInputNumberFormComponent, { renderOpts, renderParams })
      }
    },
    ElDatePickerWidget: {
      createFormDesignWidgetConfig: getWidgetElDatePickerConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElDatePickerViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElDatePickerFormComponent, { renderOpts, renderParams })
      }
    },
    ElSelectWidget: {
      createFormDesignWidgetConfig: getWidgetElSelectConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElSelectViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElSelectFormComponent, { renderOpts, renderParams })
      }
    },
    ElRadioWidget: {
      createFormDesignWidgetConfig: getWidgetElRadioConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElRadioViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElRadioFormComponent, { renderOpts, renderParams })
      }
    },
    ElCheckboxWidget: {
      createFormDesignWidgetConfig: getWidgetElCheckboxConfig,
      createFormDesignWidgetFieldValue: () => [],
      renderFormDesignWidgetView (renderOpts: any, renderParams: any) {
        return h(WidgetElCheckboxViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts: any, renderParams: any) {
        return h(WidgetElCheckboxFormComponent, { renderOpts, renderParams })
      }
    },
    ElSwitchWidget: {
      createFormDesignWidgetConfig: getWidgetElSwitchConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElSwitchViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElSwitchFormComponent, { renderOpts, renderParams })
      }
    }
  })
}
