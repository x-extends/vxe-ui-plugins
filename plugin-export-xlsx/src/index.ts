import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalInterceptorHandles } from 'vxe-pc-ui'
import type { VxeTableConstructor, VxeTablePropTypes, VxeTableDefines, TableReactData, TableInternalData, VxeTablePrivateMethods } from 'vxe-table'
import type ExcelJS from 'exceljs'

let VxeUI: VxeUIExport
let globalExcelJS: any

declare module 'vxe-table' {
  export namespace VxeTableDefines {
    export interface ExtortSheetMethodParams {
      workbook: ExcelJS.Workbook;
      worksheet: ExcelJS.Worksheet;
    }
    export interface ColumnInfo {
      _row: any;
      _colSpan: number;
      _rowSpan: number;
      childNodes: VxeTableDefines.ColumnInfo[];
    }
  }
}

const defaultHeaderBackgroundColor = 'f2f2f2'
const defaultCellFontColor = '000000'
const defaultCellBorderStyle = 'thin'
const defaultCellBorderColor = 'e0e0e0'

const defaultFontSizeMaps: Record<string, number> = {
  default: 14,
  medium: 14,
  small: 13,
  mini: 12
}

const httpPromiseMaps: Record<string, Promise<any>> = {}
const httpBufferMaps: Record<string, ArrayBuffer> = {}

function getCellLabel ($xeTable: VxeTableConstructor, column: VxeTableDefines.ColumnInfo, cellValue: any) {
  const { cellType, cellRender, editRender } = column
  const renderOpts = editRender || cellRender
  if (cellValue) {
    if (renderOpts) {
      if (['VxeImage', 'VxeImageGroup', 'VxeUpload'].includes(renderOpts.name || '')) {
        return ''
      }
    }
    if (column.type === 'seq') {
      const tableProps = $xeTable
      const { treeConfig } = tableProps
      if (!treeConfig) {
        if (!isNaN(cellValue)) {
          return Number(cellValue)
        }
      }
      return XEUtils.toValueString(cellValue)
    }
    switch (cellType) {
      case 'string':
        return XEUtils.toValueString(cellValue)
      case 'number':
        if (!isNaN(cellValue)) {
          return Number(cellValue)
        }
        break
    }
    if (cellValue.length < 12 && !isNaN(cellValue)) {
      return Number(cellValue)
    }
  }
  return XEUtils.toValueString(cellValue)
}

function getFooterData (opts: VxeTablePropTypes.ExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function getFooterCellValue ($xeTable: VxeTableConstructor, opts: VxeTablePropTypes.ExportConfig, row: any, column: VxeTableDefines.ColumnInfo) {
  const _columnIndex = $xeTable.getVTColumnIndex(column)
  // 兼容老模式
  if (XEUtils.isArray(row)) {
    return getCellLabel($xeTable, column, row[_columnIndex])
  }
  return getCellLabel($xeTable, column, XEUtils.get(row, column.field))
}

function getValidColumn (column: VxeTableDefines.ColumnInfo): VxeTableDefines.ColumnInfo {
  const { childNodes } = column
  const isColGroup = childNodes && childNodes.length
  if (isColGroup) {
    return getValidColumn(childNodes[0])
  }
  return column
}

function setExcelRowHeight (excelRow: ExcelJS.Row, height: number) {
  if (height) {
    excelRow.height = XEUtils.floor(height * 1.13, 2)
  }
}

function setExcelCellStyle (excelCell: ExcelJS.Cell, align?: VxeTablePropTypes.Align | VxeTablePropTypes.HeaderAlign | VxeTablePropTypes.FooterAlign) {
  excelCell.protection = {
    locked: false
  }
  excelCell.alignment = {
    vertical: 'middle',
    horizontal: align || 'left'
  }
}

function getImgType (name: string) {
  const index = name.lastIndexOf('.')
  let ext = ''
  if (index > 0) {
    ext = name.substring(index + 1).toLowerCase()
  }
  return (ext as 'png' | 'jpeg' | 'gif') || 'png'
}

function getExcelCellCurrencySymbol (currencySymbol: string) {
  if (currencySymbol === '$') {
    return '$'
  }
  if (currencySymbol === '¥' || currencySymbol === '￥') {
    return '¥'
  }
  return currencySymbol
}

function getExcelCellNumberValSymbol (digits: number) {
  return `0.${XEUtils.padEnd('0', digits, '0')}`
}

function getExcelCellNumberColorSymbol (showNegativeStatus: boolean | undefined) {
  if (showNegativeStatus) {
    return '[Red]'
  }
  return ''
}

function settExcelCellFormat (workbook: ExcelJS.Workbook, worksheet: ExcelJS.Worksheet, excelCell: ExcelJS.Cell, column: VxeTableDefines.ColumnInfo, excelRow: ExcelJS.Row, row: any) {
  const { getConfig, getI18n } = VxeUI
  const { cellType, cellRender, editRender } = column
  if (cellType !== 'string') {
    const renderOpts = editRender || cellRender
    if (renderOpts) {
      const { name, props = {}, showNegativeStatus } = renderOpts
      if (name === 'VxeNumberInput' || name === 'FormatNumberInput') {
        const { type, digits } = props
        const numberInputConfig = getConfig().numberInput || {}
        if (type === 'amount') {
          const numDigits = digits || numberInputConfig.digits || 2
          const numSymbol = getExcelCellNumberValSymbol(numDigits)
          excelCell.numFmt = `##${numSymbol};${getExcelCellNumberColorSymbol(showNegativeStatus)}\\-##${numSymbol}`
          const showCurrency = props.showCurrency
          if (XEUtils.isBoolean(showCurrency) ? showCurrency : numberInputConfig.showCurrency) {
            const currencySymbol = getExcelCellCurrencySymbol(props.currencySymbol || numberInputConfig.currencySymbol || getI18n('vxe.numberInput.currencySymbol') || '')
            excelCell.numFmt = `"${currencySymbol}"#,##${numSymbol};${getExcelCellNumberColorSymbol(showNegativeStatus)}-"${currencySymbol}"#,##${numSymbol}`
          }
        } else {
          const numDigits = digits || (type === 'float' ? numberInputConfig.digits : 2) || 1
          const numSymbol = getExcelCellNumberValSymbol(numDigits)
          excelCell.numFmt = `##${numSymbol};${getExcelCellNumberColorSymbol(showNegativeStatus)}\\-##${numSymbol}`
        }
      } else if (renderOpts.name === 'VxeImage' || renderOpts.name === 'VxeImageGroup') {
        const { width, height } = (renderOpts.name === 'VxeImage' ? props : props.imageStyle) || {}
        const cellValue = XEUtils.get(row, column.field)
        if (cellValue) {
          // 支持一张图片
          (XEUtils.isArray(cellValue) ? cellValue.slice(0, 1) : [cellValue]).forEach(item => {
            if (item) {
              const imgUrl = XEUtils.isString(item) ? item : item.url
              if (imgUrl) {
                const imgBuffer = httpBufferMaps[imgUrl]
                if (imgBuffer) {
                  const cellImage = workbook.addImage({
                    buffer: imgBuffer,
                    extension: getImgType(imgUrl)
                  })
                  worksheet.addImage(cellImage, {
                    tl: {
                      col: Math.max(0, XEUtils.toNumber(excelCell.col) - 1),
                      row: Math.max(0, XEUtils.toNumber(excelCell.row) - 1)
                    },
                    ext: {
                      width: XEUtils.toNumber(width || height) || 24,
                      height: XEUtils.toNumber(height || width) || 24
                    }
                  })
                }
              }
            }
          })
        }
      } else if (renderOpts.name === 'VxeUpload' && props.mode === 'image') {
        const { urlField, typeField, imageConfig } = props
        const { width, height } = imageConfig || {}
        const cellValue = XEUtils.get(row, column.field)
        if (cellValue) {
          // 支持一张图片
          (XEUtils.isArray(cellValue) ? cellValue.slice(0, 1) : [cellValue]).forEach(item => {
            if (item) {
              const imgUrl = XEUtils.isString(item) ? item : item[urlField || 'url']
              if (imgUrl) {
                const imgBuffer = httpBufferMaps[imgUrl]
                if (imgBuffer) {
                  const cellImage = workbook.addImage({
                    buffer: imgBuffer,
                    extension: (XEUtils.isString(item) ? '' : item[typeField]) || getImgType(imgUrl)
                  })
                  worksheet.addImage(cellImage, {
                    tl: {
                      col: Math.max(0, XEUtils.toNumber(excelCell.col) - 1),
                      row: Math.max(0, XEUtils.toNumber(excelCell.row) - 1)
                    },
                    ext: {
                      width: XEUtils.toNumber(width || height) || 24,
                      height: XEUtils.toNumber(height || width) || 24
                    }
                  })
                }
              }
            }
          })
        }
      }
    }
  }
}

function getDefaultBorderStyle () {
  return {
    top: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    left: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    bottom: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    right: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    }
  }
}

function handleParseColumnImageUrl (params: VxeGlobalInterceptorHandles.InterceptorExportParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  const { columns, datas } = params
  const urlList: string[] = []
  columns.forEach(column => {
    const { cellRender, editRender } = column
    const renderOpts = editRender || cellRender || {}
    const { name, props = {} } = renderOpts
    if (name === 'VxeImage' || name === 'VxeImageGroup') {
      datas.forEach(rowRest => {
        const row = rowRest._row
        const cellValue = XEUtils.get(row, column.field)
        if (cellValue) {
          (XEUtils.isArray(cellValue) ? cellValue : [cellValue]).forEach(item => {
            if (item) {
              const imgUrl = item.url ? item.url : `${item || ''}`
              if (imgUrl) {
                urlList.push(imgUrl)
              }
            }
          })
        }
      })
    } else if (name === 'VxeUpload' && props.mode === 'image') {
      const { urlField } = props
      datas.forEach(rowRest => {
        const row = rowRest._row
        const cellValue = XEUtils.get(row, column.field)
        if (cellValue) {
          (XEUtils.isArray(cellValue) ? cellValue : [cellValue]).forEach(item => {
            if (item) {
              const imgUrl = XEUtils.isString(item) ? item : item[urlField || 'url']
              if (imgUrl) {
                urlList.push(imgUrl)
              }
            }
          })
        }
      })
    }
  })
  if (urlList.length) {
    return handleFetchImage(urlList)
  }
}

function handleFetchImage (urlList: string[]) {
  let fIndex = 0
  const handleStartFetch = (): Promise<void> => {
    if (fIndex < urlList.length) {
      const restList: Promise<any>[] = []
      let count = 1
      for (; fIndex < urlList.length; fIndex++) {
        const url = urlList[fIndex]
        if (!httpBufferMaps[url]) {
          if (!httpPromiseMaps[url]) {
            count++
            httpPromiseMaps[url] = fetch(url).then(res => res.arrayBuffer()).then(arrayBuffer => {
              httpBufferMaps[url] = arrayBuffer
              delete httpPromiseMaps[url]
            }).catch(() => {
              delete httpPromiseMaps[url]
            })
          }
          restList.push(httpPromiseMaps[url])
        }
        if (count >= 4) {
          break
        }
      }
      return Promise.all(restList).then(() => {
        if (fIndex < urlList.length) {
          return handleStartFetch()
        }
      })
    }
    return Promise.resolve()
  }
  return handleStartFetch()
}

function exportXLSX (params: VxeGlobalInterceptorHandles.InterceptorExportParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  const msgKey = XEUtils.uniqueId('xlsx')
  const { modal, getI18n } = VxeUI
  const { $table, $grid, options, columns, colgroups, datas } = params
  const tableProps = $table
  const tableReactData = $table as unknown as TableReactData
  const { headerAlign: allHeaderAlign, align: allAlign, footerAlign: allFooterAlign } = tableProps
  const { rowHeight } = tableReactData
  const { message, download, sheetName, isHeader, isFooter, isMerge, isColgroup, original, useStyle, sheetMethod } = options
  const vSize = $table.computeSize
  const columnOpts = $table.computeColumnOpts
  const showMsg = message !== false
  const mergeCells = $table.getMergeCells()
  const fontSize = defaultFontSizeMaps[vSize || ''] || 14
  const colList: any[] = []
  let footList: any[] = []
  const footArr: any[] = []
  const sheetCols: any[] = []
  const sheetMerges: { s: { r: number, c: number }, e: { r: number, c: number } }[] = []
  let beforeRowCount = 0
  columns.forEach((column) => {
    const { id, renderWidth } = column
    sheetCols.push({
      key: id,
      width: XEUtils.ceil(renderWidth / 7.2, 1)
    })
  })
  // 处理表头
  if (isHeader) {
    // 处理分组
    if (isColgroup && colgroups) {
      colgroups.forEach((cols, rIndex) => {
        const groupHead: any = {}
        columns.forEach((column) => {
          groupHead[column.id] = null
        })
        cols.forEach((column) => {
          const { _colSpan, _rowSpan } = column
          const validColumn = getValidColumn(column)
          const columnIndex = columns.indexOf(validColumn)
          const headExportMethod = (column as any).headerExportMethod || (columnOpts as any).headerExportMethod
          groupHead[validColumn.id] = headExportMethod ? headExportMethod({ column, options, $table }) : (original ? validColumn.field : column.getTitle())
          if (_colSpan > 1 || _rowSpan > 1) {
            sheetMerges.push({
              s: { r: rIndex, c: columnIndex },
              e: { r: rIndex + _rowSpan - 1, c: columnIndex + _colSpan - 1 }
            })
          }
        })
        colList.push(groupHead)
      })
    } else {
      const colHead: any = {}
      columns.forEach((column) => {
        const { id, field } = column as any
        const headExportMethod = (column as any).headerExportMethod || (columnOpts as any).headerExportMethod
        colHead[id] = headExportMethod ? headExportMethod({ column, options, $table }) : (original ? field : column.getTitle())
      })
      colList.push(colHead)
    }
    beforeRowCount += colList.length
  }
  // 处理合并
  if (isMerge) {
    mergeCells.forEach(mergeItem => {
      const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
      sheetMerges.push({
        s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
        e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
      })
    })
  }
  const rowList = datas
  const rowArr = rowList.map(item => {
    const rest: any = {}
    columns.forEach((column) => {
      rest[column.id] = getCellLabel($table, column, item[column.id])
    })
    return rest
  })
  beforeRowCount += rowList.length
  // 处理表尾
  if (isFooter) {
    const { footerData } = $table.getTableData()
    footList = getFooterData(options, footerData)
    const mergeFooterItems = $table.getMergeFooterItems()
    // 处理合并
    if (isMerge) {
      mergeFooterItems.forEach(mergeItem => {
        const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
        sheetMerges.push({
          s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
          e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
        })
      })
    }
    footList.forEach((row) => {
      const item: any = {}
      columns.forEach((column) => {
        item[column.id] = getFooterCellValue($table, options, row, column)
      })
      footArr.push(item)
    })
  }
  const exportMethod = () => {
    const workbook: ExcelJS.Workbook = new (globalExcelJS || (window as any).ExcelJS).Workbook()
    const sheet = workbook.addWorksheet(sheetName || 'Sheet1')
    workbook.creator = 'vxe-table'
    sheet.columns = sheetCols
    if (isHeader) {
      sheet.addRows(colList).forEach(excelRow => {
        if (useStyle) {
          setExcelRowHeight(excelRow, rowHeight)
        }
        excelRow.eachCell(excelCell => {
          const excelCol = sheet.getColumn(excelCell.col)
          const column: any = $table.getColumnById(excelCol.key as string)
          const { headerAlign, align } = column
          setExcelCellStyle(excelCell, headerAlign || align || allHeaderAlign || allAlign)
          if (useStyle) {
            Object.assign(excelCell, {
              font: {
                bold: true,
                size: fontSize,
                color: {
                  argb: defaultCellFontColor
                }
              },
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {
                  argb: defaultHeaderBackgroundColor
                }
              },
              border: getDefaultBorderStyle()
            })
          }
        })
      })
    }
    sheet.addRows(rowArr).forEach((excelRow, rIndex) => {
      const row = rowList[rIndex]._row
      if (useStyle) {
        setExcelRowHeight(excelRow, rowHeight)
      }
      excelRow.eachCell(excelCell => {
        const excelCol = sheet.getColumn(excelCell.col)
        const column = $table.getColumnById(excelCol.key as string)
        if (column) {
          const { align } = column
          setExcelCellStyle(excelCell, align || allAlign)
          settExcelCellFormat(workbook, sheet, excelCell, column, excelRow, row)
          if (useStyle) {
            Object.assign(excelCell, {
              font: {
                size: fontSize,
                color: {
                  argb: defaultCellFontColor
                }
              },
              border: getDefaultBorderStyle()
            })
          }
        }
      })
    })
    if (isFooter) {
      sheet.addRows(footArr).forEach((excelRow, rIndex) => {
        const row = footList[rIndex]
        if (useStyle) {
          setExcelRowHeight(excelRow, rowHeight)
        }
        excelRow.eachCell(excelCell => {
          const excelCol = sheet.getColumn(excelCell.col)
          const column = $table.getColumnById(excelCol.key as string)
          if (column) {
            const { footerAlign, align } = column
            setExcelCellStyle(excelCell, footerAlign || align || allFooterAlign || allAlign)
            settExcelCellFormat(workbook, sheet, excelCell, column, excelRow, row)
            if (useStyle) {
              Object.assign(excelCell, {
                font: {
                  size: fontSize,
                  color: {
                    argb: defaultCellFontColor
                  }
                },
                border: getDefaultBorderStyle()
              })
            }
          }
        })
      })
    }

    return Promise.resolve(
      // 自定义处理
      sheetMethod
        ? sheetMethod({
          options: options,
          workbook,
          worksheet: sheet,
          columns,
          colgroups,
          datas,
          $grid,
          $table
        })
        : null
    ).then(() => {
      sheetMerges.forEach(({ s, e }) => {
        sheet.mergeCells(s.r + 1, s.c + 1, e.r + 1, e.c + 1)
      })
      return workbook.xlsx.writeBuffer().then(buffer => {
        const type = 'application/octet-stream'
        const blob = new Blob([buffer], { type })
        if (modal) {
          modal.close(msgKey)
        }
        if (showMsg && modal) {
          modal.message({
            content: getI18n('vxe.table.expSuccess'),
            status: 'success'
          })
        }
        if (download) {
          // 导出 xlsx
          downloadFile(params, blob, options)
          return {
            status: true
          }
        }
        return { type, content: '', blob }
      })
    }).catch(() => {
      if (modal) {
        modal.close(msgKey)
      }
      if (showMsg && modal) {
        modal.message({
          content: getI18n('vxe.table.expError'),
          status: 'error'
        })
      }
      return {
        status: false
      }
    })
  }

  return Promise.all([
    handleParseColumnImageUrl(params)
  ]).then(() => {
    if (showMsg && modal) {
      modal.message({
        id: msgKey,
        content: getI18n('vxe.table.expLoading'),
        status: 'loading',
        duration: -1
      })
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(exportMethod())
        }, 1500)
      })
    }
    return exportMethod()
  })
}

function downloadFile (params: VxeGlobalInterceptorHandles.InterceptorExportParams, blob: Blob, options: VxeTablePropTypes.ExportConfig) {
  const { modal, t } = VxeUI
  const { message, filename, type } = options
  const showMsg = message !== false
  if (window.Blob) {
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, `${filename}.${type}`)
    } else {
      const linkElem = document.createElement('a')
      linkElem.target = '_blank'
      linkElem.download = `${filename}.${type}`
      linkElem.href = URL.createObjectURL(blob)
      document.body.appendChild(linkElem)
      linkElem.click()
      document.body.removeChild(linkElem)
    }
  } else {
    if (showMsg && modal) {
      modal.alert({ content: t('vxe.error.notExp'), status: 'error' })
    }
  }
}

function checkImportData (tableFields: string[], fields: string[]) {
  return fields.some(field => tableFields.indexOf(field) > -1)
}

function importError (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  const { modal, t } = VxeUI
  const { $table, options } = params
  const tableInternalData = $table as unknown as TableInternalData

  const { _importReject } = tableInternalData
  const showMsg = options.message !== false
  if (showMsg && modal) {
    modal.message({ content: t('vxe.error.impFields'), status: 'error' })
  }
  if (_importReject) {
    _importReject({ status: false })
  }
}

function importXLSX (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  const { modal, getI18n } = VxeUI
  const { $table, columns, options, file } = params
  const tableInternalData = $table as unknown as TableInternalData

  const { _importResolve } = tableInternalData
  const showMsg = options.message !== false
  const fileReader = new FileReader()
  fileReader.onerror = () => {
    importError(params)
  }
  fileReader.onload = (evnt) => {
    const tableFields: string[] = []
    columns.forEach((column) => {
      const field = column.field
      if (field) {
        tableFields.push(field)
      }
    })
    const workbook: ExcelJS.Workbook = new (globalExcelJS || (window as any).ExcelJS).Workbook()
    const readerTarget = evnt.target
    if (readerTarget) {
      workbook.xlsx.load(readerTarget.result as ArrayBuffer).then(wb => {
        const firstSheet = wb.worksheets[0]
        if (firstSheet) {
          const sheetValues = Array.from(firstSheet.getSheetValues()) as string[][]
          const fieldIndex = XEUtils.findIndexOf(sheetValues, (list) => list && list.length > 0)
          const fields = sheetValues[fieldIndex] as string[]
          const status = checkImportData(tableFields, fields)
          if (status) {
            const records = sheetValues.slice(fieldIndex + 1).map(list => {
              const item : any = {}
              list.forEach((cellValue, cIndex) => {
                item[fields[cIndex]] = cellValue
              })
              const record: any = {}
              tableFields.forEach(field => {
                record[field] = XEUtils.isUndefined(item[field]) ? null : item[field]
              })
              return record
            })
            $table.createData(records)
              .then((data: any[]) => {
                let loadRest: Promise<any>
                if (options.mode === 'insert') {
                  loadRest = $table.insertAt(data, -1)
                } else {
                  loadRest = $table.reloadData(data)
                }
                return loadRest.then(() => {
                  if (_importResolve) {
                    _importResolve({ status: true })
                  }
                })
              })
            if (showMsg && modal) {
              modal.message({ content: getI18n('vxe.table.impSuccess', [records.length]), status: 'success' })
            }
          } else {
            importError(params)
          }
        } else {
          importError(params)
        }
      })
    } else {
      importError(params)
    }
  }
  fileReader.readAsArrayBuffer(file)
}

function hasAdvancedVersion (tableVersion: string) {
  const vRest = tableVersion ? `${tableVersion}`.match(/(\d+)\.(\d+)\./) : null
  return vRest && XEUtils.toNumber(vRest[1]) >= 3 && XEUtils.toNumber(vRest[2]) >= 14
}

function handleImportEvent (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  if (params.options.type === 'xlsx') {
    if (VxeUI && hasAdvancedVersion(VxeUI.tableVersion || '')) {
      return {
        result: importXLSX(params),
        status: false
      }
    }
    return false
  }
}

function handleExportEvent (params: VxeGlobalInterceptorHandles.InterceptorExportParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }) {
  if (params.options.type === 'xlsx') {
    if (VxeUI && hasAdvancedVersion(VxeUI.tableVersion || '')) {
      return {
        result: exportXLSX(params),
        status: false
      }
    }
    return false
  }
}

export const VxeUIPluginExportXLSX = {
  install (core: VxeUIExport, options?: {
    ExcelJS?: any
  }) {
    VxeUI = core

    // 检查版本
    if (!/^(3)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    globalExcelJS = options ? options.ExcelJS : null

    VxeUI.setConfig({
      table: {
        importConfig: {
          _typeMaps: {
            xlsx: 1
          }
        },
        exportConfig: {
          _typeMaps: {
            xlsx: 1
          }
        }
      }
    })
    VxeUI.interceptor.mixin({
      'event.import': handleImportEvent,
      'event.export': handleExportEvent
    })
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginExportXLSX)
}

export default VxeUIPluginExportXLSX
