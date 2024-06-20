import { h } from 'vue'
import { createWidgetElInput } from './el-input'
import { createWidgetElDatePicker } from './el-date-picker'

import type { VxeUIExport } from 'vxe-pc-ui'

/**
 * 表单设计器 - 渲染器
 */
export function defineFormDesignRender (VxeUI: VxeUIExport) {
  const { getWidgetElInputConfig, WidgetElInputViewComponent, WidgetElInputFormComponent } = createWidgetElInput(VxeUI)
  const { getWidgetElDatePickerConfig, WidgetElDatePickerViewComponent, WidgetElDatePickerFormComponent } = createWidgetElDatePicker(VxeUI)

  VxeUI.renderer.mixin({
    ElInput: {
      createFormDesignWidgetConfig: getWidgetElInputConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElInputViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElInputFormComponent, { renderOpts, renderParams })
      }
    },
    ElDatePicker: {
      createFormDesignWidgetConfig: getWidgetElDatePickerConfig,
      renderFormDesignWidgetView (renderOpts, renderParams) {
        return h(WidgetElDatePickerViewComponent, { renderOpts, renderParams })
      },
      renderFormDesignWidgetFormView (renderOpts, renderParams) {
        return h(WidgetElDatePickerFormComponent, { renderOpts, renderParams })
      }
    }
  })
}
