import { VueConstructor, CreateElement } from 'vue'
import { defineVxeComponent } from './comp'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeFormConstructor, VxeFormPrivateMethods, VxeFormDefines, VxeComponentStyleType } from 'vxe-pc-ui'
import type { IDomEditor, IEditorConfig, Toolbar } from '@wangeditor/editor'
import type { VxeUIPluginRenderWangEditorOptions, WangEditorExport } from '../types'

import { defineFormRender } from './form'

let VxeUI: VxeUIExport
let globalWangEditor: WangEditorExport | undefined
let globalOptions: VxeUIPluginRenderWangEditorOptions | undefined

interface WangEditorInternalData {
  weEditor?: IDomEditor
  weToolbar?: Toolbar
  isSetModel?: boolean
}

const WangEditorComponent = defineVxeComponent({
  name: 'WangEditor',
  model: {
    prop: 'value',
    event: 'model-value'
  },
  props: {
    value: String,
    placeholder: {
      type: String,
      default: '请输入'
    },
    readonly: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: null
    },
    width: [Number, String],
    height: [Number, String],
    uploadImageMethod: Function,
    uploadVideoMethod: Function
  },
  inject: {
    $xeForm: {
      default: null
    },
    formItemInfo: {
      from: 'xeFormItemInfo',
      default: null
    }
  },
  data () {
    const xID = XEUtils.uniqueId()

    const reactData = {
    }

    return {
      ...({} as {
        internalData: WangEditorInternalData
      }),
      xID,
      reactData
    }
  },
  computed: {
    ...({} as {
      $xeForm(): (VxeFormConstructor & VxeFormPrivateMethods) | null
      formItemInfo(): VxeFormDefines.ProvideItemInfo | null
    }),
    computeFormReadonly () {
      const $xeWangEditor = this
      const props = $xeWangEditor
      const $xeForm = $xeWangEditor.$xeForm

      const { readonly } = props
      if (readonly === null) {
        if ($xeForm) {
          return $xeForm.readonly
        }
        return false
      }
      return readonly
    },
    computeIsDisabled () {
      const $xeWangEditor = this
      const props = $xeWangEditor
      const $xeForm = $xeWangEditor.$xeForm

      const { disabled } = props
      if (disabled === null) {
        if ($xeForm) {
          return $xeForm.disabled
        }
        return false
      }
      return disabled
    },
    computeEditorStyle () {
      const $xeWangEditor = this
      const props = $xeWangEditor

      const { width, height } = props
      const stys: VxeComponentStyleType = {}
      if (width) {
        stys.width = isNaN(Number(width)) ? width : `${width}px`
      }
      if (height) {
        stys.height = isNaN(Number(height)) ? height : `${height}px`
      }
      return stys
    }
  },
  methods: {
    emitModel  (value: any) {
      const $xeWangEditor = this

      $xeWangEditor.$emit('model-value', value)
    },
    getHtml () {
      const $xeWangEditor = this
      const internalData = $xeWangEditor.internalData

      const { weEditor } = internalData
      if (weEditor) {
        if (weEditor.isEmpty()) {
          return ''
        }
        return weEditor.getHtml()
      }
      return ''
    },
    setHtml (html: string) {
      const $xeWangEditor = this
      const internalData = $xeWangEditor.internalData

      const { weEditor } = internalData
      if (weEditor) {
        internalData.isSetModel = true
        weEditor.setHtml(html || '')
      }
    },
    handleChangeEvent (evnt: Event) {
      const $xeWangEditor = this
      const props = $xeWangEditor
      const $xeForm = $xeWangEditor.$xeForm
      const formItemInfo = $xeWangEditor.formItemInfo

      const value = $xeWangEditor.getHtml()
      $xeWangEditor.emitModel(value)
      if (value !== props.value) {
        $xeWangEditor.$emit('change', { value, $event: evnt })
        // 自动更新校验状态
        if ($xeForm && formItemInfo) {
          $xeForm.triggerItemEvent(evnt, formItemInfo.itemConfig.field, value)
        }
      }
    },
    initEdit () {
      const $xeWangEditor = this
      const props = $xeWangEditor
      const internalData = $xeWangEditor.internalData

      const { createEditor, createToolbar } = globalWangEditor || (window as any).wangEditor as WangEditorExport || {}
      const editorEl = $xeWangEditor.$refs.refEditorElem as HTMLDivElement
      const toolbarEl = $xeWangEditor.$refs.refToolbarElem as HTMLDivElement
      if (!createEditor || !createToolbar) {
        console.error('[VUE_APP_VXE_PLUGIN_VERSION] wangEditor needs to be installed')
        return
      }
      if (internalData.weEditor || internalData.weToolbar) {
        return
      }
      if (!editorEl || !toolbarEl) {
        return
      }

      const formReadonly = $xeWangEditor.computeFormReadonly
      const isDisabled = $xeWangEditor.computeIsDisabled

      const editorConfig: Partial<IEditorConfig> = {
        placeholder: formReadonly || isDisabled ? '' : props.placeholder,
        readOnly: !!(formReadonly || isDisabled),
        autoFocus: false,
        scroll: true,
        MENU_CONF: {
          uploadImage: {
            customUpload: (file: File, insertFn: any) => {
              const imgMethod = props.uploadImageMethod || (globalOptions ? globalOptions.uploadImageMethod : null)
              if (imgMethod) {
                return Promise.resolve(
                  imgMethod({
                    file,
                    params: {}
                  })
                ).then((res) => {
                  insertFn(res.url, res.alt || '', res.href || '')
                })
              }
              return Promise.resolve()
            }
          },
          uploadVideo: {
            customUpload: (file: File, insertFn: any) => {
              const videoMethod = props.uploadVideoMethod || (globalOptions ? globalOptions.uploadVideoMethod : null)
              if (videoMethod) {
                return Promise.resolve(
                  videoMethod({
                    file,
                    params: {}
                  })
                ).then((res) => {
                  insertFn(res.url, res.poster || '')
                })
              }
              return Promise.resolve()
            }
          }
        },
        onChange: () => {
          if (!internalData.isSetModel) {
            $xeWangEditor.handleChangeEvent(new Event('keyboard'))
          }
          internalData.isSetModel = false
        }
      }

      const weEditor = createEditor({
        selector: editorEl,
        html: props.value || '',
        config: editorConfig,
        mode: 'default'
      })
      internalData.weEditor = weEditor

      const toolbarConfig = {
        excludeKeys: [
          'emotion',
          'codeBlock'
        ]
      }

      internalData.weToolbar = createToolbar({
        editor: weEditor,
        selector: toolbarEl,
        config: toolbarConfig,
        mode: 'default'
      })
    },

    //
    // Render
    //
    renderVN (h: CreateElement) {
      const $xeWangEditor = this

      const editorStyle = $xeWangEditor.computeEditorStyle
      return h('div', {
        class: 'vxe-wang-editor'
      }, [
        h('div', {
          ref: 'refToolbarElem',
          class: 'vxe-wang-editor--toolbar'
        }),
        h('div', {
          ref: 'refEditorElem',
          class: 'vxe-wang-editor--editor',
          style: editorStyle
        })
      ])
    }
  },
  watch: {
    value (val) {
      const $xeWangEditor = this
      const internalData = $xeWangEditor.internalData

      const { weEditor } = internalData
      if (weEditor) {
        $xeWangEditor.setHtml(val || '')
      } else {
        $xeWangEditor.initEdit()
      }
    }
  },
  created () {
    this.internalData = {}
  },
  mounted () {
    const $xeWangEditor = this

    $xeWangEditor.initEdit()
  },
  beforeDestroy () {
    const $xeWangEditor = this
    const internalData = $xeWangEditor.internalData

    const { weEditor, weToolbar } = internalData
    if (weEditor) {
      weEditor.destroy()
      internalData.weEditor = undefined
    }
    if (weToolbar) {
      weToolbar.destroy()
      internalData.weToolbar = undefined
    }
  },
  render (this: any, h) {
    return this.renderVN(h)
  }
})

function pluginConfig (options?: VxeUIPluginRenderWangEditorOptions) {
  globalOptions = options
}

export const WangEditor = Object.assign({
  install (app: VueConstructor) {
    app.component(WangEditorComponent.name as string, WangEditorComponent)
  }
}, WangEditorComponent)

/**
 * 基于 Vxe UI 的扩展插件，支持渲染 wangEditor 富文本
 */
export const VxeUIPluginRenderWangEditor = {
  setConfig: pluginConfig,
  WangEditor,
  install (core: VxeUIExport, options?: VxeUIPluginRenderWangEditorOptions) {
    VxeUI = core
    globalWangEditor = options ? options.wangEditor : undefined

    // 检查版本
    if (!/^(3)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    pluginConfig(options)

    defineFormRender(VxeUI, WangEditorComponent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderWangEditor)
}

export default VxeUIPluginRenderWangEditor
