import XEUtils from 'xe-utils'
import { ref, h } from 'vue'

import type { VxeUIExport, VxeGlobalInterceptorHandles, VxeGlobalMenusHandles, VxeNumberInputComponent } from 'vxe-pc-ui'
import type { VxeTableConstructor, VxeTablePrivateMethods, VxeTableDefines, VxeColumnPropTypes, VxeTableExtendCellAreaDefines } from 'vxe-table'
import type { VxeUIPluginMenuOptions } from '../types'

let VxeUI: VxeUIExport
let handleCopy: ((content: string | number) => boolean) | undefined

const columnIndexOf = (cols: VxeTableDefines.ColumnInfo[], column: VxeTableDefines.ColumnInfo) => {
  return XEUtils.findIndexOf(cols, item => item.id === column.id)
}

const rowIndexOf = ($table: VxeTableConstructor & VxeTablePrivateMethods, rows: any[], row: any) => {
  return $table.findRowIndexOf(rows, row)
}

function handleFixedColumn (fixed: VxeColumnPropTypes.Fixed) {
  return {
    menuMethod (params: VxeGlobalMenusHandles.TableMenuMethodParams) {
      const { $table, column } = params
      XEUtils.eachTree([column], (column) => {
        column.fixed = fixed
      })
      $table.refreshColumn()
    }
  }
}

function getClipboardObj () {
  const globalStore = VxeUI.globalStore
  if (globalStore) {
    return globalStore.clipboard || ''
  }
  // 兼容老版本
  const globalConfig = (VxeUI as any).config
  if (globalConfig && globalConfig.clipboard) {
    return globalConfig.clipboard
  }
  return null
}

function setClipboardConfig (clipObj: {
  text: string
  html: string
}) {
  const globalStore = VxeUI.globalStore
  if (globalStore) {
    globalStore.clipboard = clipObj
  } else if ((VxeUI as any).config) {
    // 兼容老版本
    (VxeUI as any).config.clipboard = clipObj
  }
}

let copyElem: HTMLTextAreaElement

function handleText (content: string | number) {
  if (!copyElem) {
    copyElem = document.createElement('textarea')
    copyElem.id = '$XECopy'
    const styles = copyElem.style
    styles.width = '48px'
    styles.height = '24px'
    styles.position = 'fixed'
    styles.zIndex = '0'
    styles.left = '-500px'
    styles.top = '-500px'
    document.body.appendChild(copyElem)
  }
  copyElem.value = content === null || content === undefined ? '' : ('' + content)
}

function copyText (content: string | number): boolean {
  let result = false
  try {
    handleText(content)
    copyElem.select()
    copyElem.setSelectionRange(0, copyElem.value.length)
    result = document.execCommand('copy')
    copyElem.blur()
  } catch (e) {}
  return result
}

function handleCopyOrCut (params: VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, isCut?: boolean) {
  const { $event, $table, row, column } = params
  if (row && column) {
    const tableProps = $table.props
    const { mouseConfig } = tableProps
    const { computeMouseOpts } = $table.getComputeMaps()
    const mouseOpts = computeMouseOpts.value
    let text = ''
    if (mouseConfig && mouseOpts.area) {
      if (isCut) {
        $table.triggerCutCellAreaEvent($event)
      } else {
        $table.triggerCopyCellAreaEvent($event)
      }
      const clipboard = getClipboardObj()
      text = clipboard ? clipboard.text : ''
    } else {
      // 操作内置剪贴板
      text = XEUtils.toValueString(XEUtils.get(row, column.field))
      setClipboardConfig({ text, html: '' })
    }
    // 开始复制操作
    if (XEUtils.isFunction(handleCopy)) {
      handleCopy(text)
    } else {
      copyText(text)
    }
  }
}

function checkCellOverlay (params: VxeGlobalInterceptorHandles.InterceptorShowMenuParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, cellAreas: VxeTableExtendCellAreaDefines.MouseCellArea[]) {
  const { $table } = params
  const { visibleData } = $table.getTableData()
  const { visibleColumn } = $table.getTableColumn()
  const indexMaps: { [key: string]: boolean } = {}
  for (let aIndex = 0, areaSize = cellAreas.length; aIndex < areaSize; aIndex++) {
    const areaItem = cellAreas[aIndex]
    const { rows, cols } = areaItem
    for (let rIndex = 0, rowSize = rows.length; rIndex < rowSize; rIndex++) {
      const offsetRow = rows[rIndex]
      const orIndex = rowIndexOf($table, visibleData, offsetRow)
      for (let cIndex = 0, colSize = cols.length; cIndex < colSize; cIndex++) {
        const offsetColumn = cols[cIndex]
        const ocIndex = columnIndexOf(visibleColumn, offsetColumn)
        const key = orIndex + ':' + ocIndex
        if (indexMaps[key]) {
          return false
        }
        indexMaps[key] = true
      }
    }
  }
  return true
}

function getBeenMerges (params: (VxeGlobalMenusHandles.TableMenuMethodParams | VxeGlobalInterceptorHandles.InterceptorShowMenuParams) & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  const { $table } = params
  const tableProps = $table.props
  const { mouseConfig } = tableProps
  const { computeMouseOpts } = $table.getComputeMaps()
  const mouseOpts = computeMouseOpts.value
  const { visibleData } = $table.getTableData()
  const { visibleColumn } = $table.getTableColumn()
  const cellAreas = mouseConfig && mouseOpts.area ? $table.getCellAreas() : []
  const mergeList = $table.getMergeCells()
  return mergeList.filter(({ row: mergeRowIndex, col: mergeColIndex, rowspan: mergeRowspan, colspan: mergeColspan }) => {
    return cellAreas.some(areaItem => {
      const { rows, cols } = areaItem
      const startRowIndex = rowIndexOf($table, visibleData, rows[0])
      const endRowIndex = rowIndexOf($table, visibleData, rows[rows.length - 1])
      const startColIndex = columnIndexOf(visibleColumn, cols[0])
      const endColIndex = columnIndexOf(visibleColumn, cols[cols.length - 1])
      return mergeRowIndex >= startRowIndex && mergeRowIndex + mergeRowspan - 1 <= endRowIndex && mergeColIndex >= startColIndex && mergeColIndex + mergeColspan - 1 <= endColIndex
    })
  })
}

function handleClearMergeCells (params: VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  const { $table } = params
  const beenMerges = getBeenMerges(params)
  if (beenMerges.length) {
    $table.removeMergeCells(beenMerges)
  }
  return beenMerges
}

function checkPrivilege (item: VxeTableDefines.MenuFirstOption | VxeTableDefines.MenuChildOption, params: VxeGlobalInterceptorHandles.InterceptorShowMenuParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  const { code } = item
  const { $table, row, column, type } = params
  const tableProps = $table.props
  const { editConfig, mouseConfig } = tableProps
  switch (code) {
    case 'CLEAR_ALL_SORT': {
      const sortList = $table.getSortColumns()
      item.disabled = !sortList.length
      break
    }
    case 'CLEAR_ALL_FILTER': {
      const filterList = $table.getCheckedFilters()
      item.disabled = !filterList.length
      break
    }
    case 'CLEAR_ALL_MERGE': {
      const mergeCells = $table.getMergeCells()
      const mergeFooterItems = $table.getMergeFooterItems()
      item.disabled = !mergeCells.length && !mergeFooterItems.length
      break
    }
    case 'CLEAR_MERGE_CELL': {
      const beenMerges = getBeenMerges(params)
      item.disabled = !beenMerges.length
      break
    }
    case 'COPY_TITLE': {
      item.disabled = !column || type !== 'header'
      break
    }
    case 'EDIT_CELL':
    case 'CLEAR_CELL':
    case 'CLEAR_ROW':
    case 'COPY_CELL':
    case 'CUT_CELL':
    case 'PASTE_CELL':
    case 'MERGE_OR_CLEAR':
    case 'MERGE_CELL':
    case 'REVERT_CELL':
    case 'REVERT_ROW':
    case 'INSERT_AT_ROW':
    case 'INSERT_AT_ACTIVED_ROW':
    case 'INSERT_AT_EDIT_ROW':
    case 'DELETE_ROW':
    case 'DELETE_AREA_ROW':
    case 'CLEAR_SORT':
    case 'SORT_ASC':
    case 'SORT_DESC':
    case 'CLEAR_FILTER':
    case 'FILTER_CELL':
    case 'EXPORT_ROW':
    case 'OPEN_FIND':
    case 'OPEN_REPLACE':
    case 'HIDDEN_COLUMN':
    case 'FIXED_LEFT_COLUMN':
    case 'FIXED_RIGHT_COLUMN':
    case 'CLEAR_FIXED_COLUMN': {
      item.disabled = !column
      if (column) {
        const { computeMouseOpts } = $table.getComputeMaps()
        const mouseOpts = computeMouseOpts.value
        const isChildCol = !!column.parentId
        switch (code) {
          case 'CLEAR_SORT': {
            item.disabled = !column.sortable || !column.order
            break
          }
          case 'SORT_ASC':
          case 'SORT_DESC':
            item.disabled = !column.sortable
            break
          case 'FILTER_CELL':
          case 'CLEAR_FILTER':
            item.disabled = !column.filters || !column.filters.length
            if (!item.disabled) {
              switch (code) {
                case 'CLEAR_FILTER':
                  item.disabled = !column.filters.some((option) => option.checked)
                  break
              }
            }
            break
          case 'REVERT_CELL': {
            item.disabled = !row || !column.field || !$table.isUpdateByRow(row, column.field)
            break
          }
          case 'REVERT_ROW': {
            item.disabled = !row || !column.field || !$table.isUpdateByRow(row)
            break
          }
          case 'OPEN_FIND':
          case 'OPEN_REPLACE': {
            item.disabled = !(mouseConfig && mouseOpts.area)
            break
          }
          case 'EDIT_CELL': {
            item.disabled = !editConfig || !column.editRender
            break
          }
          case 'COPY_CELL':
          case 'CUT_CELL':
          case 'PASTE_CELL': {
            const cellAreas = mouseConfig && mouseOpts.area ? $table.getCellAreas() : []
            item.disabled = cellAreas.length > 1
            if (!item.disabled) {
              switch (code) {
                case 'PASTE_CELL': {
                  const clipboard = getClipboardObj()
                  item.disabled = !clipboard || !clipboard.text
                  break
                }
              }
            }
            break
          }
          case 'MERGE_OR_CLEAR':
          case 'MERGE_CELL': {
            const cellAreas = mouseConfig && mouseOpts.area ? $table.getCellAreas() : []
            item.disabled = !cellAreas.length || (cellAreas.length === 1 && cellAreas[0].rows.length === 1 && cellAreas[0].cols.length === 1) || !checkCellOverlay(params, cellAreas)
            break
          }
          case 'FIXED_LEFT_COLUMN':
            item.disabled = isChildCol || column.fixed === 'left'
            break
          case 'FIXED_RIGHT_COLUMN':
            item.disabled = isChildCol || column.fixed === 'right'
            break
          case 'CLEAR_FIXED_COLUMN':
            item.disabled = isChildCol || !column.fixed
            break
        }
      }
      break
    }
  }
}

function handlePrivilegeEvent (params: VxeGlobalInterceptorHandles.InterceptorShowMenuParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  params.options.forEach((list) => {
    list.forEach((item) => {
      checkPrivilege(item, params)
      if (item.children) {
        item.children.forEach((child) => {
          checkPrivilege(child, params)
        })
      }
    })
  })
  return true
}

function selectMultipleRows () {
  return new Promise<{
    size: number
  }>(resolve => {
    if (VxeUI.modal) {
      const VxeNumberInputComponent = VxeUI.getComponent<VxeNumberInputComponent>('VxeNumberInput')
      if (VxeNumberInputComponent) {
        const rowSize = ref(1)
        VxeUI.modal.alert({
          title: '请输入行数',
          width: 220,
          maskClosable: false,
          slots: {
            default () {
              return h(VxeNumberInputComponent, {
                modelValue: rowSize.value,
                min: 1,
                max: 100,
                align: 'center',
                style: {
                  width: '100%'
                },
                'onUpdate:modelValue' (value: any) {
                  rowSize.value = value
                }
              })
            }
          }
        }).then((type) => {
          if (type === 'confirm') {
            resolve({
              size: rowSize.value || 1
            })
          } else {
            resolve({
              size: 0
            })
          }
        })
      } else {
        console.error(VxeUI.getI18n('vxe.error.reqComp', ['vxe-number-input']))
        resolve({
          size: 0
        })
      }
    } else {
      resolve({
        size: 0
      })
    }
  })
}

function pluginSetup (options?: VxeUIPluginMenuOptions) {
  if (options && options.copy) {
    handleCopy = options.copy
  }
}

/**
 * 基于 Vxe UI 的扩展插件，支持右键菜单
 */
export const VxeUIPluginMenu = {
  setConfig: pluginSetup,
  install (core: VxeUIExport, options?: VxeUIPluginMenuOptions) {
    VxeUI = core

    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    pluginSetup(options)

    VxeUI.menus.mixin({
      /**
       * 清除单元格数据的值；如果启用 mouse-config.area 功能，则清除区域范围内的单元格数据
       */
      CLEAR_CELL: {
        menuMethod (params) {
          const { $table, row, column } = params
          if (row && column) {
            const tableProps = $table.props
            const { mouseConfig } = tableProps
            const { computeMouseOpts } = $table.getComputeMaps()
            const mouseOpts = computeMouseOpts.value
            if (mouseConfig && mouseOpts.area) {
              const cellAreas = $table.getCellAreas()
              if (cellAreas && cellAreas.length) {
                cellAreas.forEach(areaItem => {
                  const { rows, cols } = areaItem
                  cols.forEach(column => {
                    rows.forEach(row => {
                      $table.clearData(row, column.field)
                    })
                  })
                })
              }
            } else {
              $table.clearData(row, column.field)
            }
          }
        }
      },
      /**
       * 清除行数据的值
       */
      CLEAR_ROW: {
        menuMethod (params) {
          const { $table, row } = params
          if (row) {
            $table.clearData(row)
          }
        }
      },
      /**
       * 清除复选框选中行数据的值
       */
      CLEAR_CHECKBOX_ROW: {
        menuMethod (params) {
          const { $table } = params
          $table.clearData($table.getCheckboxRecords())
        }
      },
      /**
       * 清除区域选择范围内数据的值
       */
      CLEAR_AREA_ROW: {
        menuMethod (params) {
          const { $table, row, column } = params
          const tableProps = $table.props
          const { mouseConfig } = tableProps
          const { computeMouseOpts } = $table.getComputeMaps()
          const mouseOpts = computeMouseOpts.value
          if (mouseConfig && mouseOpts.area) {
            const cellAreas = mouseConfig && mouseOpts.area ? $table.getCellAreas() : []
            cellAreas.forEach(areaItem => {
              const { rows } = areaItem
              $table.clearData(rows)
            })
          } else {
            if (row && column) {
              $table.clearData(row)
            }
          }
        }
      },
      /**
       * 清除所有数据的值
       */
      CLEAR_ALL: {
        menuMethod (params) {
          const { $table } = params
          $table.clearData()
        }
      },
      /**
       * 还原单元格数据的值；如果启用 mouse-config.area 功能，则还原区域范围内的单元格数据
       */
      REVERT_CELL: {
        menuMethod (params) {
          const { $table, row, column } = params
          if (row && column) {
            const tableProps = $table.props
            const { mouseConfig } = tableProps
            const { computeMouseOpts } = $table.getComputeMaps()
            const mouseOpts = computeMouseOpts.value
            if (mouseConfig && mouseOpts.area) {
              const cellAreas = $table.getCellAreas()
              if (cellAreas && cellAreas.length) {
                cellAreas.forEach(areaItem => {
                  const { rows, cols } = areaItem
                  cols.forEach(column => {
                    rows.forEach(row => {
                      $table.revertData(row, column.field)
                    })
                  })
                })
              }
            } else {
              $table.revertData(row, column.field)
            }
          }
        }
      },
      /**
       * 还原行数据的值
       */
      REVERT_ROW: {
        menuMethod (params) {
          const { $table, row } = params
          if (row) {
            $table.revertData(row)
          }
        }
      },
      /**
       * 还原复选框选中行数据的值
       */
      REVERT_CHECKBOX_ROW: {
        menuMethod (params) {
          const { $table } = params
          $table.revertData($table.getCheckboxRecords())
        }
      },
      /**
       * 还原所有数据的值
       */
      REVERT_ALL: {
        menuMethod (params) {
          const { $table } = params
          $table.revertData()
        }
      },
      /**
       * 复制列头标题
       */
      COPY_TITLE: {
        menuMethod (params) {
          const { column } = params
          const text = column.getTitle()
          if (text) {
          // 开始复制操作
            if (XEUtils.isFunction(handleCopy)) {
              handleCopy(text)
            } else {
              copyText(text)
            }
          }
        }
      },
      /**
       * 复制单元格数据的值；如果启用 mouse-config.area 功能，则复制区域范围内的单元格数据，支持 Excel 和 WPS
       */
      COPY_CELL: {
        menuMethod (params) {
          handleCopyOrCut(params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods })
        }
      },
      /**
       * 剪贴单元格数据的值；如果启用 mouse-config.area 功能，则剪贴区域范围内的单元格数据，支持 Excel 和 WPS
       */
      CUT_CELL: {
        menuMethod (params) {
          handleCopyOrCut(params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }, true)
        }
      },
      /**
       * 粘贴从表格中被复制的数据；如果启用 mouse-config.area 功能，则粘贴区域范围内的单元格数据，不支持读取剪贴板
       */
      PASTE_CELL: {
        menuMethod (params) {
          const { $event, $table, row, column } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          const tableProps = $table.props
          const { mouseConfig } = tableProps
          const { computeMouseOpts } = $table.getComputeMaps()
          const mouseOpts = computeMouseOpts.value
          if (mouseConfig && mouseOpts.area) {
            $table.triggerPasteCellAreaEvent($event)
          } else {
            const clipboard = getClipboardObj()
            // 读取内置剪贴板
            if (clipboard && clipboard.text) {
              XEUtils.set(row, column.field, clipboard.text)
            }
          }
        }
      },
      /**
       * 如果启用 mouse-config.area 功能，如果所选区域内已存在合并单元格，则取消临时合并，否则临时合并
       */
      MERGE_OR_CLEAR: {
        menuMethod (params) {
          const { $event, $table } = params
          const cellAreas = $table.getCellAreas()
          const beenMerges = getBeenMerges(params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods })
          let status = false
          if (beenMerges.length) {
            $table.removeMergeCells(beenMerges)
          } else {
            status = true
            $table.setMergeCells(
              cellAreas.map(({ rows, cols }) => {
                return {
                  row: rows[0],
                  col: cols[0],
                  rowspan: rows.length,
                  colspan: cols.length
                }
              })
            )
          }
          const targetAreas = cellAreas.map(({ rows, cols }) => ({ rows, cols }))
          $table.dispatchEvent('cell-area-merge', { status, targetAreas }, $event)
        }
      },
      /**
       * 如果启用 mouse-config.area 功能，临时合并区域范围内的单元格，不管是否存在已合并
       */
      MERGE_CELL: {
        menuMethod (params) {
          const { $event, $table } = params
          const { visibleData } = $table.getTableData()
          const { visibleColumn } = $table.getTableColumn()
          const cellAreas = $table.getCellAreas()
          handleClearMergeCells(params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods })
          if (cellAreas.some(({ rows, cols }) => rows.length === visibleData.length || cols.length === visibleColumn.length)) {
            if (VxeUI.modal) {
              VxeUI.modal.message({ content: VxeUI.getI18n('vxe.pro.area.mergeErr'), status: 'error', id: 'operErr' })
            }
            return
          }
          $table.setMergeCells(
            cellAreas.map(({ rows, cols }) => {
              return {
                row: rows[0],
                col: cols[0],
                rowspan: rows.length,
                colspan: cols.length
              }
            })
          )
          const targetAreas = cellAreas.map(({ rows, cols }) => ({ rows, cols }))
          $table.dispatchEvent('cell-area-merge', { status: true, targetAreas }, $event)
        }
      },
      /**
       * 如果启用 mouse-config.area 功能，清除区域范围内单元格的临时合并状态
       */
      CLEAR_MERGE_CELL: {
        menuMethod (params) {
          const { $event, $table } = params
          const beenMerges = handleClearMergeCells(params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods })
          if (beenMerges.length) {
            $table.dispatchEvent('clear-cell-area-merge', { mergeCells: beenMerges }, $event)
          }
        }
      },
      /**
       * 清除所有单元格及表尾的临时合并状态
       */
      CLEAR_ALL_MERGE: {
        menuMethod (params) {
          const { $event, $table } = params
          const mergeCells = $table.getMergeCells()
          const mergeFooterItems = $table.getMergeFooterItems()
          $table.clearMergeCells()
          $table.clearMergeFooterItems()
          $table.dispatchEvent('clear-merge', { mergeCells, mergeFooterItems }, $event)
        }
      },
      /**
       * 编辑单元格
       */
      EDIT_CELL: {
        menuMethod (params) {
          const { $table, row, column } = params
          if ($table.setEditCell) {
            $table.setEditCell(row, column)
          } else {
          // 兼容老版本
            $table.setActiveCell(row, column.field)
          }
        }
      },
      /**
       * 编辑行
       */
      EDIT_ROW: {
        menuMethod (params) {
          const { $table, row } = params
          if ($table.setEditRow) {
            $table.setEditRow(row)
          } else {
          // 兼容老版本
            $table.setActiveRow(row)
          }
        }
      },
      /**
       * 插入数据
       */
      INSERT_ROW: {
        menuMethod (params) {
          const { $table, menu } = params
          $table.insert(menu.params || {})
        }
      },
      /**
       * 插入数据并激活编辑状态
       * @deprecated
       */
      INSERT_ACTIVED_ROW: {
        menuMethod (params) {
          const { $table, menu, column } = params
          const args: any[] = menu.params || [] // [{}, 'field']
          $table.insert(args[0] || {})
            .then(({ row }) => {
              if ($table.setEditCell) {
                $table.setEditCell(row, args[1] || column)
              } else {
              // 兼容老版本
                $table.setActiveCell(row, args[1] || column.field)
              }
            })
        }
      },
      /**
       * 插入数据并激活编辑状态
       * @deprecated
       */
      INSERT_EDIT_ROW: {
        menuMethod (params) {
          const { $table, menu, column } = params
          const args: any[] = menu.params || [] // [{}, 'field']
          $table.insert(args[0] || {})
            .then(({ row }) => {
              if ($table.setEditCell) {
                $table.setEditCell(row, args[1] || column)
              } else {
              // 兼容老版本
                $table.setActiveCell(row, args[1] || column.field)
              }
            })
        }
      },
      /**
       * 插入数据到指定位置
       */
      INSERT_AT_ROW: {
        menuMethod (params) {
          const { $table, menu, row } = params
          if (row) {
            $table.insertAt(menu.params || {}, row)
          }
        }
      },
      /**
       * 插入多行数据
       */
      BATCH_INSERT_AT_ROW: {
        menuMethod (params) {
          const { $table, menu, row } = params
          if (row) {
            selectMultipleRows().then(({ size }) => {
              if (size) {
                $table.insertAt(XEUtils.range(0, size).map(() => Object.assign({}, menu.params)), row)
              }
            })
          }
        }
      },
      /**
       * 插入数据到指定位置
       */
      INSERT_NEXT_AT_ROW: {
        menuMethod (params) {
          const { $table, menu, row } = params
          if (row) {
            $table.insertNextAt(menu.params || {}, row)
          }
        }
      },
      /**
       * 批量插入数据到指定位置
       */
      BATCH_INSERT_NEXT_AT_ROW: {
        menuMethod (params) {
          const { $table, menu, row } = params
          if (row) {
            selectMultipleRows().then(({ size }) => {
              if (size) {
                $table.insertNextAt(XEUtils.range(0, size).map(() => Object.assign({}, menu.params)), row)
              }
            })
          }
        }
      },
      /**
       * 插入数据到指定位置并激活编辑状态
       */
      INSERT_AT_ACTIVED_ROW: {
        menuMethod (params) {
          const { $table, menu, row, column } = params
          if (row) {
            const args: any[] = menu.params || [] // [{}, 'field']
            $table.insertAt(args[0] || {}, row)
              .then(({ row }) => {
                if ($table.setEditCell) {
                  $table.setEditCell(row, args[1] || column)
                } else {
                // 兼容老版本
                  $table.setActiveCell(row, args[1] || column.field)
                }
              })
          }
        }
      },
      /**
       * 插入数据到指定位置并激活编辑状态
       */
      INSERT_AT_EDIT_ROW: {
        menuMethod (params) {
          const { $table, menu, row, column } = params
          if (row) {
            const args: any[] = menu.params || [] // [{}, 'field']
            $table.insertAt(args[0] || {}, row)
              .then(({ row }) => {
                if ($table.setEditCell) {
                  $table.setEditCell(row, args[1] || column)
                } else {
                // 兼容老版本
                  $table.setActiveCell(row, args[1] || column.field)
                }
              })
          }
        }
      },
      /**
       * 批量插入数据到指定位置并激活编辑状态
       */
      BATCH_INSERT_AT_EDIT_ROW: {
        menuMethod (params) {
          const { $table, menu, row, column } = params
          if (row) {
            const args: any[] = menu.params || [] // [{}, 'field']
            selectMultipleRows().then(({ size }) => {
              if (size) {
                $table.insertAt(XEUtils.range(0, size).map(() => Object.assign({}, args[0])), row)
                  .then(({ row }) => {
                    if ($table.setEditCell) {
                      $table.setEditCell(row, args[1] || column)
                    } else {
                      // 兼容老版本
                      $table.setActiveCell(row, args[1] || column.field)
                    }
                  })
              }
            })
          }
        }
      },
      /**
       * 插入数据到指定位置并激活编辑状态
       */
      INSERT_NEXT_AT_EDIT_ROW: {
        menuMethod (params) {
          const { $table, menu, row, column } = params
          if (row) {
            const args: any[] = menu.params || [] // [{}, 'field']
            $table.insertNextAt(args[0] || {}, row)
              .then(({ row }) => {
                if ($table.setEditCell) {
                  $table.setEditCell(row, args[1] || column)
                } else {
                // 兼容老版本
                  $table.setActiveCell(row, args[1] || column.field)
                }
              })
          }
        }
      },
      /**
       * 批量插入数据到指定位置并激活编辑状态
       */
      BATCH_INSERT_NEXT_AT_EDIT_ROW: {
        menuMethod (params) {
          const { $table, menu, row, column } = params
          if (row) {
            const args: any[] = menu.params || [] // [{}, 'field']
            selectMultipleRows().then(({ size }) => {
              if (size) {
                $table.insertNextAt(XEUtils.range(0, size).map(() => Object.assign({}, args[0])), row)
                  .then(({ row }) => {
                    if ($table.setEditCell) {
                      $table.setEditCell(row, args[1] || column)
                    } else {
                      // 兼容老版本
                      $table.setActiveCell(row, args[1] || column.field)
                    }
                  })
              }
            })
          }
        }
      },
      /**
       * 移除行数据
       */
      DELETE_ROW: {
        menuMethod (params) {
          const { $table, row } = params
          if (row) {
            $table.remove(row)
          }
        }
      },
      /**
       * 如果启用 mouse-config.area 功能，移除所选区域行数据
       */
      DELETE_AREA_ROW: {
        menuMethod (params) {
          const { $table, row } = params
          const tableProps = $table.props
          const { mouseConfig } = tableProps
          const { computeMouseOpts } = $table.getComputeMaps()
          const mouseOpts = computeMouseOpts.value
          if (mouseConfig && mouseOpts.area) {
            const cellAreas = $table.getCellAreas()
            cellAreas.forEach(areaItem => {
              const { rows } = areaItem
              $table.remove(rows)
            })
          } else {
            if (row) {
              $table.remove(row)
            }
          }
        }
      },
      /**
       * 移除复选框选中行数据
       */
      DELETE_CHECKBOX_ROW: {
        menuMethod (params) {
          const { $table } = params
          $table.removeCheckboxRow()
        }
      },
      /**
       * 移除所有行数据
       */
      DELETE_ALL: {
        menuMethod (params) {
          const { $table } = params
          $table.remove()
        }
      },
      /**
       * 清除所选列排序条件
       */
      CLEAR_SORT: {
        menuMethod (params) {
          const { $event, $table, column } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          if (column) {
            $table.triggerSortEvent($event, column, null)
          }
        }
      },
      /**
       * 清除所有排序条件
       */
      CLEAR_ALL_SORT: {
        menuMethod (params) {
          const { $event, $table } = params
          const sortList = $table.getSortColumns()
          if (sortList.length) {
            $table.clearSort()
            $table.dispatchEvent('clear-sort', { sortList }, $event)
          }
        }
      },
      /**
       * 按所选列的值升序
       */
      SORT_ASC: {
        menuMethod (params) {
          const { $event, $table, column } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          if (column) {
            $table.triggerSortEvent($event, column, 'asc')
          }
        }
      },
      /**
       * 按所选列的值倒序
       */
      SORT_DESC: {
        menuMethod (params) {
          const { $event, $table, column } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          if (column) {
            $table.triggerSortEvent($event, column, 'desc')
          }
        }
      },
      /**
       * 清除复选框选中列的筛选条件
       */
      CLEAR_FILTER: {
        menuMethod (params) {
          const { $event, $table, column } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          if (column) {
            $table.handleClearFilter(column)
            $table.confirmFilterEvent($event)
          }
        }
      },
      /**
       * 清除所有列筛选条件
       */
      CLEAR_ALL_FILTER: {
        menuMethod (params) {
          const { $event, $table } = params
          const filterList = $table.getCheckedFilters()
          if (filterList.length) {
            $table.clearFilter()
            $table.dispatchEvent('clear-filter', { filterList }, $event)
          }
        }
      },
      /**
       * 根据单元格值筛选
       */
      FILTER_CELL: {
        menuMethod (params) {
          const { $table, row, column } = params
          if (row && column) {
            const { field, filters } = column
            if (filters.length) {
              const option = filters[0]
              option.data = XEUtils.get(row, field)
              option.checked = true
              $table.updateData()
            }
          }
        }
      },
      /**
       * 导出行数据
       */
      EXPORT_ROW: {
        menuMethod (params) {
          const { $table, menu, row } = params
          if (row) {
            const opts = { data: [row] }
            $table.exportData(XEUtils.assign({}, menu.params ? menu.params[0] : {}, opts))
          }
        }
      },
      /**
       * 导出复选框选中行数据
       */
      EXPORT_CHECKBOX_ROW: {
        menuMethod (params) {
          const { $table, menu } = params
          const opts = { data: $table.getCheckboxRecords() }
          $table.exportData(XEUtils.assign({}, menu.params ? menu.params[0] : {}, opts))
        }
      },
      /**
       * 导出所有行数据
       */
      EXPORT_ALL: {
        menuMethod (params) {
          const { $table, menu } = params
          $table.exportData(menu.params)
        }
      },
      /**
       * 打印所有行数据
       */
      PRINT_ALL: {
        menuMethod (params) {
          const { $table, menu } = params
          $table.print(menu.params)
        }
      },
      /**
       * 打印复选框选中行
       */
      PRINT_CHECKBOX_ROW: {
        menuMethod (params) {
          const { $table, menu } = params
          const opts = { data: $table.getCheckboxRecords() }
          $table.print(XEUtils.assign(opts, menu.params))
        }
      },
      /**
       * 打开查找功能
       */
      OPEN_FIND: {
        menuMethod (params) {
          const { $event, $table } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          $table.triggerFNROpenEvent($event, 'find')
        }
      },
      /**
       * 打开替换功能
       */
      OPEN_REPLACE: {
        menuMethod (params) {
          const { $event, $table } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
          $table.triggerFNROpenEvent($event, 'replace')
        }
      },
      /**
       * 隐藏当前列
       */
      HIDDEN_COLUMN: {
        menuMethod (params) {
          const { $table, column } = params
          if (column) {
            $table.hideColumn(column)
          }
        }
      },
      /**
       * 将列固定到左侧
       */
      FIXED_LEFT_COLUMN: handleFixedColumn('left'),
      /**
       * 将列固定到右侧
       */
      FIXED_RIGHT_COLUMN: handleFixedColumn('right'),
      /**
       * 清除固定列
       */
      CLEAR_FIXED_COLUMN: handleFixedColumn(null),
      /**
       * 重置列的可视状态
       */
      RESET_COLUMN: {
        menuMethod (params) {
          const { $table } = params
          $table.resetColumn({ visible: true, resizable: false })
        }
      },
      /**
       * 重置列宽状态
       */
      RESET_RESIZABLE: {
        menuMethod (params) {
          const { $table } = params
          $table.resetColumn({ visible: false, resizable: true })
        }
      },
      /**
       * 重置列的所有状态
       */
      RESET_ALL: {
        menuMethod (params) {
          const { $table } = params
          $table.resetColumn(true)
        }
      }
    })

    VxeUI.interceptor.add('event.showMenu', handlePrivilegeEvent)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginMenu)
}

export default VxeUIPluginMenu
