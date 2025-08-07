import { App, h, defineComponent, ref, watch, inject, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeFormConstructor, VxeFormPrivateMethods, VxeFormDefines, VxeComponentStyleType } from 'vxe-pc-ui'
import type { IDomEditor, IEditorConfig, Toolbar } from '@wangeditor/editor'
import type { VxeUIPluginRenderWangEditorOptions, WangEditorExport } from '../types'

import { defineFormRender } from './form'
import { defineFormDesignRender } from './form-design'

let VxeUI: VxeUIExport
let globalWangEditor: WangEditorExport | undefined
let globalOptions: VxeUIPluginRenderWangEditorOptions | undefined

interface WangEditorInternalData {
  weEditor?: IDomEditor
  weToolbar?: Toolbar
  isSetModel?: boolean
}

const WangEditorComponent = defineComponent({
  name: 'WangEditor',
  props: {
    modelValue: String,
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
  emits: [
    'update:modelValue',
    'change'
  ],
  setup (props, context) {
    const { emit } = context

    const $xeForm = inject<(VxeFormConstructor & VxeFormPrivateMethods)| null>('$xeForm', null)
    const formItemInfo = inject<VxeFormDefines.ProvideItemInfo | null>('xeFormItemInfo', null)

    const xID = XEUtils.uniqueId()

    const refEditorElem = ref<HTMLDivElement>()
    const refToolbarElem = ref<HTMLDivElement>()

    const reactData = reactive({
    })

    const internalData: WangEditorInternalData = {}

    const computeFormReadonly = computed(() => {
      const { readonly } = props
      if (readonly === null) {
        if ($xeForm) {
          return $xeForm.props.readonly
        }
        return false
      }
      return readonly
    })

    const computeIsDisabled = computed(() => {
      const { disabled } = props
      if (disabled === null) {
        if ($xeForm) {
          return $xeForm.props.disabled
        }
        return false
      }
      return disabled
    })

    const computeEditorStyle = computed(() => {
      const { width, height } = props
      const stys: VxeComponentStyleType = {}
      if (width) {
        stys.width = isNaN(Number(width)) ? width : `${width}px`
      }
      if (height) {
        stys.height = isNaN(Number(height)) ? height : `${height}px`
      }
      return stys
    })

    const getHtml = () => {
      const { weEditor } = internalData
      if (weEditor) {
        if (weEditor.isEmpty()) {
          return ''
        }
        return weEditor.getHtml()
      }
      return ''
    }

    const setHtml = (html: string) => {
      const { weEditor } = internalData
      if (weEditor) {
        internalData.isSetModel = true
        weEditor.setHtml(html || '')
      }
    }

    const handleChangeEvent = (evnt: Event) => {
      const value = getHtml()
      emit('update:modelValue', value)
      if (value !== props.modelValue) {
        emit('change', { value, $event: evnt })
        // 自动更新校验状态
        if ($xeForm && formItemInfo) {
          $xeForm.triggerItemEvent(evnt, formItemInfo.itemConfig.field, value)
        }
      }
    }

    const initEdit = () => {
      const { createEditor, createToolbar } = globalWangEditor || (window as any).wangEditor as WangEditorExport || {}
      const editorEl = refEditorElem.value
      const toolbarEl = refToolbarElem.value
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

      const formReadonly = computeFormReadonly.value
      const isDisabled = computeIsDisabled.value

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
            handleChangeEvent(new Event('keyboard'))
          }
          internalData.isSetModel = false
        }
      }

      const weEditor = createEditor({
        selector: editorEl,
        html: props.modelValue || '',
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
    }

    const $xeWangEditor = {
      xID,
      reactData,
      internalData,

      getHtml,
      setHtml,
      renderVN () {
        const editorStyle = computeEditorStyle.value
        return h('div', {
          class: 'vxe-wang-editor'
        }, [
          h('div', {
            ref: refToolbarElem,
            class: 'vxe-wang-editor--toolbar'
          }),
          h('div', {
            ref: refEditorElem,
            class: 'vxe-wang-editor--editor',
            style: editorStyle
          })
        ])
      }
    }

    watch(() => props.modelValue, (val) => {
      const { weEditor } = internalData
      if (weEditor) {
        setHtml(val || '')
      } else {
        initEdit()
      }
    })

    onMounted(() => {
      initEdit()
    })

    onBeforeUnmount(() => {
      const { weEditor, weToolbar } = internalData
      if (weEditor) {
        weEditor.destroy()
        internalData.weEditor = undefined
      }
      if (weToolbar) {
        weToolbar.destroy()
        internalData.weToolbar = undefined
      }
    })

    return $xeWangEditor
  },
  render () {
    return this.renderVN()
  }
})

function pluginSetup (options?: VxeUIPluginRenderWangEditorOptions) {
  globalOptions = options
}

export const WangEditor = Object.assign({
  install (app: App) {
    app.component(WangEditorComponent.name as string, WangEditorComponent)
  }
}, WangEditorComponent)

/**
 * 基于 Vxe UI 的扩展插件，支持渲染 wangEditor 富文本
 */
export const VxeUIPluginRenderWangEditor = {
  setConfig: pluginSetup,
  WangEditor,
  install (core: VxeUIExport, options?: VxeUIPluginRenderWangEditorOptions) {
    VxeUI = core
    globalWangEditor = options ? options.wangEditor : undefined

    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion || VxeUI.tableVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    pluginSetup(options)

    defineFormRender(VxeUI, WangEditorComponent)
    defineFormDesignRender(VxeUI, WangEditorComponent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderWangEditor)
}

export default VxeUIPluginRenderWangEditor
