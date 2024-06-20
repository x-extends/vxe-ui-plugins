import { h } from 'vue'
import { createWidgetAInput } from './a-input'
import { createWidgetADatePicker } from './a-date-picker'

import type { VxeUIExport } from 'vxe-pc-ui'

/**
 * 表单设计器 - 渲染器
 */
export function defineFormDesignRender (VxeUI: VxeUIExport) {
  const { getWidgetAInputConfig, WidgetAInputViewComponent, WidgetAInputFormComponent } = createWidgetAInput(VxeUI)
  const { getWidgetADatePickerConfig, WidgetADatePickerViewComponent, WidgetADatePickerFormComponent } = createWidgetADatePicker(VxeUI)

  VxeUI.renderer.mixin({
    AInput: {
      createFormDesignWidgetConfig: getWidgetAInputConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetAInputViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetAInputFormComponent, { renderOpts, renderParams })
      }
    },
    ADatePicker: {
      createFormDesignWidgetConfig: getWidgetADatePickerConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetADatePickerViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetADatePickerFormComponent, { renderOpts, renderParams })
      }
    }
  })
}
