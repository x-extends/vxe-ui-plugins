import { App } from 'vue'
import { VxeUIExport } from 'vxe-pc-ui'
import { createEditor, createToolbar } from '@wangeditor/editor'

export interface WangEditorExport {
  createEditor: typeof createEditor
  createToolbar: typeof createToolbar
}

export const WangEditor: {
  install(app: App): void
}

export interface VxeUIPluginRenderWangEditorOptions {
  wangEditor?: WangEditorExport
  uploadImageMethod?(params: { file: File }): Promise<{
    url: string
    alt?: string
    href?: string
  }> | {
    url: string
    alt?: string
    href?: string
  }
  uploadVideoMethod?(params: { file: File }): Promise<{
    url: string
    poster?: string
  }> | {
    url: string
    poster?: string
  }
}

/**
 * 基于 Vxe UI 的扩展插件，支持渲染 wangEditor 富文本
 */
export declare const VxeUIPluginRenderWangEditor: {
  setConfig(options?: VxeUIPluginRenderWangEditorOptions): void
  install (VxeUI: VxeUIExport, options?: VxeUIPluginRenderWangEditorOptions): void
}

export default VxeUIPluginRenderWangEditor
