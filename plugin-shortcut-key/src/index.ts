import XEUtils from 'xe-utils'

import type { VxePagerInstance, PagerPrivateMethods } from 'vxe-pc-ui'
import type { VxeUIExport, VxeGlobalInterceptorHandles, VxeTableConstructor, VxeTablePrivateMethods } from 'vxe-table'
import type { ShortcutKeyConf, VxeUIPluginShortcutKeyOptions, ShortcutKeySettingConfig } from '../types'

let VxeUI: VxeUIExport

/**
 * 功能键
 */
export const enum FUNC_NANE {
  /**
   * 只对 edit-config 启用后有效，当单元格处于选中状态时，则进入编辑
   */
  TABLE_EDIT_ACTIVED = 'table.edit.actived',
  /**
   * 只对 edit-config 启用后有效，当单元格处于激活状态时，则退出编辑
   */
  TABLE_EDIT_CLOSED = 'table.edit.closed',
  /**
   * 只对 edit-config / mouse-config 启用后有效，当单元格处于激活状态或者选中状态，则移动到左侧单元格
   */
  TABLE_EDIT_TAB_LEFT_MOVE = 'table.edit.tab.leftMove',
  /**
   * 只对 edit-config / mouse-config 启用后有效，当单元格处于激活状态或者选中状态，则移动到右侧单元格
   */
  TABLE_EDIT_TAB_RIGHT_MOVE = 'table.edit.tab.rightMove',
  /**
   * 只对 edit-config / mouse-config 启用后有效，当单元格处于激活状态或者选中状态，则移动到上面单元格
   */
  TABLE_EDIT_ENTER_UP_MOVE = 'table.edit.enter.upMove',
  /**
   * 只对 edit-config / mouse-config 启用后有效，当单元格处于激活状态或者选中状态，则移动到下面单元格
   */
  TABLE_EDIT_ENTER_DOWN_MOVE = 'table.edit.enter.downMove',
  /**
   * 只对 mouse-config 启用后有效，当单元格处于选中状态，则移动到左边的单元格
   */
  TABLE_CELL_LEFT_MOVE = 'table.cell.leftMove',
  /**
   * 只对 mouse-config 启用后有效，当单元格处于选中状态，则移动到上面的单元格
   */
  TABLE_CELL_UP_MOVE = 'table.cell.upMove',
  /**
   * 只对 mouse-config 启用后有效，当单元格处于选中状态，则移动到右边的单元格
   */
  TABLE_CELL_RIGHT_MOVE = 'table.cell.rightMove',
  /**
   * 只对 mouse-config 启用后有效，当单元格处于选中状态，则移动到下面的单元格
   */
  TABLE_CELL_DOWN_MOVE = 'table.cell.downMove',
  /**
   * 只对 highlight-current-row 启用后有效，高亮行向上移动
   */
  TABLE_ROW_CURRENT_TOP_MOVE = 'table.row.current.topMove',
  /**
   * 只对 highlight-current-row 启用后有效，高亮行向上移动
   */
  TABLE_ROW_CURRENT_DOWN_MOVE = 'table.row.current.downMove',
  /**
   * 只对 pager-config 启用后有效，则进入上一页
   */
  PAGER_PREV_PAGE = 'pager.prevPage',
  /**
   * 只对 pager-config 启用后有效，则进入下一页
   */
  PAGER_NEXT_PAGE = 'pager.nextPage',
  /**
   * 只对 pager-config 启用后有效，则向上翻页
   */
  PAGER_PREV_JUMP = 'pager.prevJump',
  /**
   * 只对 pager-config 启用后有效，则向下翻页
   */
  PAGER_NEXT_JUMP = 'pager.nextJump'
}

export const enum SKEY_NANE {
  TRIGGER = 'trigger',
  EMIT = 'emit'
}

export class SKey {
  realKey: string;
  specialKey: string;
  funcName?: FUNC_NANE;
  kConf?: ShortcutKeyConf;
  constructor (realKey: string, specialKey: string, funcName?: FUNC_NANE, kConf?: ShortcutKeyConf) {
    this.realKey = realKey
    this.specialKey = specialKey
    this.funcName = funcName
    this.kConf = kConf
  }

  [SKEY_NANE.TRIGGER] (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: any) {
    if (!this.specialKey || evnt[`${this.specialKey}Key`]) {
      if (this.funcName && handleFuncs[this.funcName]) {
        return handleFuncs[this.funcName](params, evnt)
      }
    }
  }

  [SKEY_NANE.EMIT] (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams, evnt: any) {
    if (!this.specialKey || evnt[`${this.specialKey}Key`]) {
      if (this.kConf && this.kConf.callback) {
        return this.kConf.callback(params, evnt)
      }
    }
  }
}

interface KeyStoreMaps {
  [propName: string]: SKey[];
}

const arrowKeys = 'right,up,left,down'.split(',')
const specialKeys = 'alt,ctrl,shift,meta'.split(',')
const settingMaps: KeyStoreMaps = {}
const listenerMaps: KeyStoreMaps = {}
const disabledMaps: KeyStoreMaps = {}

function getEventTarget (evnt: Event) {
  const target = evnt.target as HTMLElement | null
  if (target && (target as any).shadowRoot && evnt.composed) {
    return evnt.composedPath()[0] as HTMLElement || target
  }
  return target
}

function getEventKey (key: string): string {
  if (arrowKeys.indexOf(key.toLowerCase()) > -1) {
    return `Arrow${key}`
  }
  return key
}

function isTriggerPage (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams): boolean {
  return !params.$table.getActiveRecord()
}

function handleChangePage (func: 'handlePrevPage' | 'handleNextPage' | 'handlePrevJump' | 'handleNextJump') {
  return function (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams, evnt: KeyboardEvent & { target: HTMLElement }) {
    const { $grid, $table } = params
    const { props: tableProps } = $table
    const { mouseConfig } = tableProps
    const { computeMouseOpts } = $table.getComputeMaps()
    const mouseOpts = computeMouseOpts.value
    const targetEl = getEventTarget(evnt)
    if ($grid && mouseConfig && mouseOpts.selected !== true && targetEl && targetEl.tagName && ['input', 'textarea'].indexOf(targetEl.tagName.toLowerCase()) === -1 && isTriggerPage(params)) {
      const { refPager } = $grid.getRefMaps()
      const $pager = refPager.value as VxePagerInstance & PagerPrivateMethods
      if ($pager) {
        evnt.preventDefault()
        $pager[func](evnt)
      }
    }
  }
}

function handleCellTabMove (isLeft: boolean) {
  return function (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: Event) {
    const { $table } = params
    const targetParams = $table.getActiveRecord() || $table.getSelectedCell()
    if (targetParams) {
      $table.moveTabSelected(targetParams, isLeft, evnt)
    }
    return false
  }
}

function handleCellEnterMove (isTop: boolean) {
  return function (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: Event) {
    const { $table } = params
    const targetParams = $table.getActiveRecord() || $table.getSelectedCell()
    if (targetParams) {
      if ($table.moveEnterSelected) {
        $table.moveEnterSelected(targetParams, false, !isTop, false, isTop, evnt)
      } else {
        $table.moveSelected(targetParams, false, !isTop, false, isTop, evnt)
      }
    }
    return false
  }
}

function handleCellArrowMove (arrowIndex: number) {
  return function (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: Event) {
    const { $table } = params
    const selecteParams = $table.getSelectedCell()
    const arrows: boolean[] = [false, false, false, false]
    arrows[arrowIndex] = true
    if (selecteParams) {
      if ($table.moveArrowSelected) {
        $table.moveArrowSelected(selecteParams, arrows[0], arrows[1], arrows[2], arrows[3], evnt)
      } else {
        $table.moveSelected(selecteParams, arrows[0], arrows[1], arrows[2], arrows[3], evnt)
      }
      return false
    }
  }
}

function handleCurrentRowMove (isDown: boolean) {
  return function (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: Event) {
    const { $table } = params
    const { props: tableProps } = $table
    const { highlightCurrentRow } = tableProps
    const { computeRowOpts } = $table.getComputeMaps()
    const rowOpts = computeRowOpts.value
    if (rowOpts.isCurrent || highlightCurrentRow) {
      const currentRow = $table.getCurrentRecord()
      if (currentRow) {
        $table.moveCurrentRow(!isDown, isDown, evnt)
        return false
      }
    }
  }
}

/**
 * 快捷键处理方法
 */
export const handleFuncs = {
  [FUNC_NANE.TABLE_EDIT_ACTIVED] (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams, evnt: Event) {
    const { $table } = params
    const selected = $table.getSelectedCell()
    if (selected) {
      evnt.preventDefault()
      $table.setActiveCell(selected.row, selected.column.field)
      return false
    }
  },
  [FUNC_NANE.TABLE_EDIT_CLOSED] (params: VxeGlobalInterceptorHandles.InterceptorKeydownParams, evnt: Event) {
    const { $table } = params
    const { props: tableProps } = $table
    const { mouseConfig, editConfig } = tableProps
    const { computeMouseOpts } = $table.getComputeMaps()
    const mouseOpts = computeMouseOpts.value
    if (editConfig) {
      const actived = $table.getActiveRecord()
      if (actived) {
        evnt.preventDefault()
        const cleatRest = $table.clearActived()
        if (mouseConfig && mouseOpts.selected) {
          cleatRest.then(() => $table.setSelectCell(actived.row, actived.column.field))
        }
        return false
      }
    }
  },
  [FUNC_NANE.TABLE_EDIT_TAB_RIGHT_MOVE]: handleCellTabMove(false),
  [FUNC_NANE.TABLE_EDIT_TAB_LEFT_MOVE]: handleCellTabMove(true),
  [FUNC_NANE.TABLE_EDIT_ENTER_UP_MOVE]: handleCellEnterMove(false),
  [FUNC_NANE.TABLE_EDIT_ENTER_DOWN_MOVE]: handleCellEnterMove(true),
  [FUNC_NANE.TABLE_CELL_LEFT_MOVE]: handleCellArrowMove(0),
  [FUNC_NANE.TABLE_CELL_UP_MOVE]: handleCellArrowMove(1),
  [FUNC_NANE.TABLE_CELL_RIGHT_MOVE]: handleCellArrowMove(2),
  [FUNC_NANE.TABLE_CELL_DOWN_MOVE]: handleCellArrowMove(3),
  [FUNC_NANE.TABLE_ROW_CURRENT_TOP_MOVE]: handleCurrentRowMove(false),
  [FUNC_NANE.TABLE_ROW_CURRENT_DOWN_MOVE]: handleCurrentRowMove(true),
  [FUNC_NANE.PAGER_PREV_PAGE]: handleChangePage('handlePrevPage'),
  [FUNC_NANE.PAGER_NEXT_PAGE]: handleChangePage('handleNextPage'),
  [FUNC_NANE.PAGER_PREV_JUMP]: handleChangePage('handlePrevJump'),
  [FUNC_NANE.PAGER_NEXT_JUMP]: handleChangePage('handleNextJump')
}

function runEvent (key: string, maps: any, prop: SKEY_NANE, params: VxeGlobalInterceptorHandles.InterceptorKeydownParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, evnt: Event) {
  const skeyList: SKey[] = maps[key.toLowerCase()]
  if (skeyList) {
    return !skeyList.some((skey: SKey) => skey[prop](params, evnt) === false)
  }
}

interface parseKeyRest {
  realKey: string;
  specialKey: string;
}

function parseKeys (key: string): parseKeyRest {
  let specialKey = ''
  let realKey = ''
  const keys = key.split('+')
  keys.forEach((item) => {
    item = item.toLowerCase().trim()
    if (specialKeys.indexOf(item) > -1) {
      specialKey = item
    } else {
      realKey = item
    }
  })
  if (!realKey || keys.length > 2 || (keys.length === 2 && !specialKey)) {
    throw new Error(`[VUE_APP_VXE_PLUGIN_VERSION] Invalid shortcut key configuration '${key}'.`)
  }
  return { realKey, specialKey }
}

function setKeyQueue (maps: KeyStoreMaps, kConf: ShortcutKeyConf, funcName?: FUNC_NANE) {
  const { realKey, specialKey } = parseKeys(kConf.key)
  let skeyList: SKey[] = maps[realKey]
  if (!skeyList) {
    skeyList = maps[realKey] = []
  }
  if (skeyList.some((skey) => skey.realKey === realKey && skey.specialKey === specialKey)) {
    throw new Error(`[VUE_APP_VXE_PLUGIN_VERSION] Shortcut key conflict '${kConf.key}'.`)
  }
  skeyList.push(new SKey(realKey, specialKey, funcName, kConf))
}

function parseDisabledKey (options: VxeUIPluginShortcutKeyOptions) {
  XEUtils.each(options.disabled, (conf: string | ShortcutKeyConf) => {
    const opts = XEUtils.isString(conf) ? { key: conf } : conf
    setKeyQueue(disabledMaps, XEUtils.assign({ callback: () => false }, opts))
  })
}

function parseSettingKey (options: VxeUIPluginShortcutKeyOptions) {
  XEUtils.each(options.setting, (opts: string | ShortcutKeySettingConfig, funcName: any) => {
    const kConf: any = XEUtils.isString(opts) ? { key: opts } : opts
    if (!handleFuncs[funcName as FUNC_NANE]) {
      console.error(`[VUE_APP_VXE_PLUGIN_VERSION] '${funcName}' not exist.`)
    }
    setKeyQueue(settingMaps, kConf, funcName)
  })
}

function parseListenerKey (options: VxeUIPluginShortcutKeyOptions) {
  XEUtils.each(options.tableListener, (callback: Function, key: string) => {
    if (!XEUtils.isFunction(callback)) {
      console.error(`[VUE_APP_VXE_PLUGIN_VERSION] '${key}' requires the callback function to be set.`)
    }
    setKeyQueue(listenerMaps, { key, callback })
  })
}

/**
 * 设置参数
 * @param options 参数
 */
function pluginConfig (options: VxeUIPluginShortcutKeyOptions) {
  if (options) {
    parseDisabledKey(options)
    parseSettingKey(options)
    parseListenerKey(options)
  }
}

/**
 * 基于 vxe-table 表格的扩展插件，为键盘操作提供快捷键设置
 */
export const VXETablePluginShortcutKey = {
  /**
   * 已废弃，请使用 setConfig
   * @deprecated
   */
  setup: pluginConfig,
  setConfig: pluginConfig,
  install (core: VxeUIExport, options?: VxeUIPluginShortcutKeyOptions) {
    VxeUI = core

    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    if (options) {
      pluginConfig(options)
    }
    VxeUI.interceptor.add('event.keydown', (params) => {
      const evnt = params.$event as KeyboardEvent
      const key: string = getEventKey(evnt.key)
      if (!runEvent(key, disabledMaps, SKEY_NANE.EMIT, params, evnt)) {
        if (runEvent(key, settingMaps, SKEY_NANE.TRIGGER, params, evnt) === false) {
          return false
        }
        runEvent(key, listenerMaps, SKEY_NANE.EMIT, params, evnt)
      }
    })
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VXETablePluginShortcutKey)
}

export default VXETablePluginShortcutKey
