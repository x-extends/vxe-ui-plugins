import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalInterceptorHandles, VxeGlobalMenusHandles } from 'vxe-pc-ui'
import type { VxeTableDefines, VxeTableConstructor, VxeTablePrivateMethods, TableReactData, TableInternalData } from 'vxe-table'

let VxeUI: VxeUIExport
let globalEcharts: any

interface CMItem {
  id: string;
  $chart: any;
}

function createChartModal (getOptions: (params: VxeGlobalMenusHandles.TableMenuMethodParams) => any) {
  const menuOpts: VxeGlobalMenusHandles.MenusOption = {
    menuMethod (params) {
      const { $table, menu } = params
      let { _chartModals } = $table as any
      if (!_chartModals) {
        _chartModals = ($table as any)._chartModals = []
      }
      const cmItem: CMItem = {
        id: XEUtils.uniqueId(),
        $chart: null
      }
      _chartModals.push(cmItem)
      if (VxeUI.modal) {
        let modalTitle = menu.name
        const customTitle = menu.params ? menu.params.title : ''
        if (customTitle) {
          if (XEUtils.isFunction(customTitle)) {
            modalTitle = customTitle(params)
          } else {
            modalTitle = `${customTitle}`
          }
        }
        VxeUI.modal.open({
          id: cmItem.id,
          resize: true,
          mask: false,
          lockView: false,
          escClosable: true,
          width: 600,
          minWidth: 500,
          height: 400,
          minHeight: 300,
          title: modalTitle,
          showZoom: true,
          className: 'vxe-table--ignore-areas-clear vxe-table--charts',
          slots: {
            default (params, h) {
              return [
                h('div', {
                  class: 'vxe-ui-plugin-render-echarts'
                }, [
                  h('div', {
                    class: 'vxe-ui-plugin-render-echarts--panel'
                  })
                ])
              ]
            }
          },
          events: {
            show (evntParams) {
              const { $modal } = evntParams
              const elem = $modal.$refs.refElem as HTMLDivElement
              const chartElem: HTMLDivElement | null = elem ? elem.querySelector('.vxe-ui-plugin-render-echarts') : null
              if (chartElem) {
                const $chart = (globalEcharts || (window as any).echarts).init(chartElem)
                $chart.setOption(getOptions(params))
                cmItem.$chart = $chart
              }
            },
            hide (evntParams) {
              const { $modal } = evntParams
              XEUtils.remove(_chartModals, item => item.id === $modal.id)
              const { $chart } = cmItem
              if ($chart) {
                $chart.dispose()
                cmItem.$chart = null
              }
            },
            zoom () {
              const { $chart } = cmItem
              if ($chart) {
                $chart.resize()
              }
            },
            resize () {
              const { $chart } = cmItem
              if ($chart) {
                $chart.resize()
              }
            }
          }
        })
      }
    }
  }
  return menuOpts
}

interface legendOpts {
  data: any[];
}

const handleCellValue = (params: VxeGlobalMenusHandles.TableMenuMethodParams, row: any, column: VxeTableDefines.ColumnInfo, isCategory: boolean) => {
  const { $table } = params as VxeGlobalMenusHandles.TableMenuMethodParams & { $table: VxeTableConstructor & VxeTablePrivateMethods }
  const tableProps = $table
  const { aggregateConfig, rowGroupConfig } = tableProps
  const tableReactData = $table as unknown as TableReactData
  const { isRowGroupStatus } = tableReactData
  const { field, rowGroupNode, aggFunc } = column

  let cellValue = $table.getCellLabel(row, column)
  if ((aggregateConfig || rowGroupConfig) && isRowGroupStatus && row.isAggregate) {
    const tableInternalData = $table as unknown as TableInternalData
    const { fullColumnFieldData } = tableInternalData
    const aggregateOpts = $table.computeAggregateOpts || {}
    const { mode, contentMethod, mapChildrenField, countFields } = aggregateOpts
    const aggCalcMethod = aggregateOpts.calcValuesMethod || aggregateOpts.countMethod || aggregateOpts.aggregateMethod
    const groupField = row.groupField
    const groupContent = row.groupContent
    const childList = mapChildrenField ? (row[mapChildrenField] || []) : []
    const childCount = row.childCount
    if (isCategory) {
      return groupContent
    }
    const colRest = fullColumnFieldData[groupField] || {}
    const ctParams = {
      $table,
      groupField,
      groupColumn: (colRest ? colRest.column : null) as VxeTableDefines.ColumnInfo,
      column: column,
      groupValue: groupContent,
      children: childList,
      childCount,
      aggValue: null as any
    }
    if (mode === 'column' ? field === groupField : rowGroupNode) {
      cellValue = groupContent
      if (contentMethod) {
        cellValue = `${contentMethod(ctParams)}`
      }
    } else if ($table.getPivotTableAggregateCellAggValue) {
      cellValue = $table.getPivotTableAggregateCellAggValue({
        $table,
        row,
        column
      })
    } else if (aggFunc === true || (countFields && countFields.includes(field))) {
      if (aggCalcMethod) {
        ctParams.aggValue = childCount
        cellValue = `${aggCalcMethod(ctParams)}`
      }
    }
  }
  return cellValue || '-'
}

const menuMap = {
  CHART_BAR_X_AXIS: createChartModal((params) => {
    const { $table, menu } = params
    const cellAreas = $table.getCellAreas ? $table.getCellAreas() : []
    const { rows, cols } = cellAreas[0]
    const { params: chartParams = {} } = menu
    const { category } = chartParams
    const categoryColumn = $table.getColumnByField(category) || cols[0]
    const serieColumns = cols.filter((column) => column.field !== categoryColumn.field)
    const legendOpts: legendOpts = {
      data: []
    }
    const seriesOpts: any[] = []
    const yAxisOpts = {
      type: 'category',
      data: rows.map((row) => handleCellValue(params, row, categoryColumn, true))
    }
    // const seriesLabel = {
    //   normal: {
    //     show: true
    //   }
    // }
    serieColumns.forEach((column) => {
      legendOpts.data.push(column.title)
      seriesOpts.push({
        name: column.title,
        type: 'bar',
        // label: seriesLabel,
        data: rows.map((row) => handleCellValue(params, row, column, false))
      })
    })
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      legend: legendOpts,
      xAxis: {
        type: 'value'
      },
      yAxis: yAxisOpts,
      series: seriesOpts
    }
    return option
  }),
  CHART_BAR_Y_AXIS: createChartModal((params) => {
    const { $table, menu } = params
    const cellAreas = $table.getCellAreas ? $table.getCellAreas() : []
    const { rows, cols } = cellAreas[0]
    const { params: chartParams = {} } = menu
    const { category } = chartParams
    const categoryColumn = $table.getColumnByField(category) || cols[0]
    const serieColumns = cols.filter((column) => column.field !== categoryColumn.field)
    const legendOpts: legendOpts = {
      data: []
    }
    const seriesOpts: any[] = []
    const xAxisOpts = {
      type: 'category',
      data: rows.map((row) => handleCellValue(params, row, categoryColumn, true))
    }
    // const seriesLabel = {
    //   normal: {
    //     show: true
    //   }
    // }
    serieColumns.forEach((column) => {
      legendOpts.data.push(column.title)
      seriesOpts.push({
        name: column.title,
        type: 'bar',
        // label: seriesLabel,
        data: rows.map((row) => handleCellValue(params, row, column, false))
      })
    })
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      legend: legendOpts,
      xAxis: xAxisOpts,
      yAxis: {
        type: 'value'
      },
      series: seriesOpts
    }
    return option
  }),
  CHART_LINE: createChartModal((params) => {
    const { $table, menu } = params
    const cellAreas = $table.getCellAreas ? $table.getCellAreas() : []
    const { rows, cols } = cellAreas[0]
    const { params: chartParams = {} } = menu
    const { category } = chartParams
    const categoryColumn = $table.getColumnByField(category) || cols[0]
    const serieColumns = cols.filter((column) => column.field !== categoryColumn.field)
    const legendOpts: legendOpts = {
      data: []
    }
    const seriesOpts: any[] = []
    const xAxisOpts = {
      type: 'category',
      data: rows.map((row) => handleCellValue(params, row, categoryColumn, true))
    }
    serieColumns.forEach((column) => {
      legendOpts.data.push(column.title)
      seriesOpts.push({
        name: column.title,
        type: 'line',
        data: rows.map((row) => handleCellValue(params, row, column, false))
      })
    })
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: legendOpts,
      grid: {
        left: '4%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: xAxisOpts,
      yAxis: {
        type: 'value'
      },
      series: seriesOpts
    }
    return option
  }),
  CHART_PIE: createChartModal((params) => {
    const { $table, menu } = params
    const cellAreas = $table.getCellAreas ? $table.getCellAreas() : []
    const { rows, cols } = cellAreas[0]
    const { params: chartParams = {} } = menu
    const { category } = chartParams
    const categoryColumn = $table.getColumnByField(category) || cols[0]
    const serieColumns = cols.filter((column) => column.field !== categoryColumn.field)
    const serieColumn = serieColumns[0]
    const legendData = rows.map((row) => handleCellValue(params, row, categoryColumn, true))
    const seriesData: any[] = []
    rows.forEach((row) => {
      seriesData.push({
        name: handleCellValue(params, row, categoryColumn, true),
        value: handleCellValue(params, row, serieColumn, false)
      })
    })
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: legendData
        // selected: data.selected
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      series: [
        {
          name: serieColumn.title,
          type: 'pie',
          radius: '50%',
          center: ['40%', '50%'],
          data: seriesData
        }
      ]
    }
    return option
  })
}

function checkPrivilege (item: VxeTableDefines.MenuFirstOption | VxeTableDefines.MenuChildOption, params: VxeGlobalInterceptorHandles.InterceptorShowMenuParams) {
  const { $table, column } = params
  const { code, params: chartParams = {} } = item
  switch (code) {
    case 'CHART_BAR_X_AXIS':
    case 'CHART_BAR_Y_AXIS':
    case 'CHART_LINE':
    case 'CHART_PIE': {
      item.disabled = !column
      if (column) {
        const cellAreas = $table.getCellAreas ? $table.getCellAreas() : []
        const validArea = cellAreas.length === 1
        if (!validArea) {
          item.disabled = true
          return
        }
        const tableProps = $table
        const { aggregateConfig, rowGroupConfig } = tableProps
        const { rows, cols } = cellAreas[0]
        const { category } = chartParams
        const firstRow = rows[0]
        if (!firstRow) {
          item.disabled = true
          return
        }
        if (aggregateConfig || rowGroupConfig) {
          if ($table.isAggregateRecord(firstRow)) {
            if (!rows.every(row => $table.isAggregateRecord(row))) {
              item.disabled = true
              return
            }
          } else {
            if (rows.some(row => $table.isAggregateRecord(row))) {
              item.disabled = true
              return
            }
          }
        }
        switch (code) {
          case 'CHART_BAR_X_AXIS':
          case 'CHART_BAR_Y_AXIS':
          case 'CHART_LINE': {
            if (category) {
              const serieColumns = cols.filter((column) => column.field !== category)
              item.disabled = serieColumns.length < 1
            } else {
              item.disabled = cols.length < 2
            }
            break
          }
          case 'CHART_PIE': {
            if (category) {
              const serieColumns = cols.filter((column) => column.field !== category)
              item.disabled = serieColumns.length !== 1
            } else {
              item.disabled = cols.length !== 2
            }
            break
          }
        }
      }
      break
    }
  }
}

function handleBeforeDestroyEvent (params: VxeGlobalInterceptorHandles.InterceptorParams) {
  const { $table } = params
  const { _chartModals } = ($table as any)
  if (_chartModals && VxeUI.modal) {
    _chartModals.slice(0).reverse().forEach((item: any) => {
      VxeUI.modal.close(item.id)
    })
  }
}

function handlePrivilegeEvent (params: VxeGlobalInterceptorHandles.InterceptorShowMenuParams) {
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
}

export const VxeUIPluginRenderEcharts = {
  install (core: VxeUIExport, options?: {
    echarts?: any
  }) {
    VxeUI = core
    globalEcharts = options ? options.echarts : null

    // 检查版本
    if (VxeUI.checkVersion) {
      const pVersion = 3
      const sVersion = 15
      if (!VxeUI.checkVersion(VxeUI.tableVersion, pVersion, sVersion)) {
        console.error(`[VUE_APP_VXE_PLUGIN_VERSION] ${VxeUI.getI18n('vxe.error.errorVersion', [`vxe-table@${VxeUI.tableVersion || '?'}`, `vxe-table v${pVersion}.${sVersion}+`])}`)
      }
    } else {
      if (!/^(3)\./.test(VxeUI.uiVersion || VxeUI.tableVersion)) {
        console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
      }
    }

    VxeUI.interceptor.add('unmounted', handleBeforeDestroyEvent)
    VxeUI.interceptor.add('event.showMenu', handlePrivilegeEvent)
    VxeUI.menus.mixin(menuMap)
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderEcharts)
}

export default VxeUIPluginRenderEcharts
