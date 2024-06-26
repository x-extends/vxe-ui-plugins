import { h } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeTableDefines, VxeGlobalInterceptorHandles, VxeGlobalMenusHandles } from 'vxe-table'

let VxeUI: VxeUIExport
let globalEcharts: any

interface CMItem {
  id: string;
  $chart: any;
}

declare module 'vxe-table' {
  export interface TableInternalData {
    _chartModals: CMItem[];
  }
}

function createChartModal (getOptions: (params: VxeGlobalMenusHandles.TableMenuMethodParams) => any) {
  const menuOpts: VxeGlobalMenusHandles.MenusOption = {
    menuMethod (params) {
      const { $table, menu } = params
      const { internalData } = $table
      let { _chartModals } = internalData
      if (!_chartModals) {
        _chartModals = internalData._chartModals = []
      }
      const cmItem: CMItem = {
        id: XEUtils.uniqueId(),
        $chart: null
      }
      _chartModals.push(cmItem)
      if (VxeUI.modal) {
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
          title: menu.name,
          showZoom: true,
          className: 'vxe-table--ignore-areas-clear vxe-table--charts',
          slots: {
            default () {
              return [
                h('div', {
                  class: 'vxe-chart--wrapper'
                }, [
                  h('div', {
                    class: 'vxe-chart--panel'
                  })
                ])
              ]
            }
          },
          onShow (evntParams) {
            const { $modal } = evntParams
            const { refElem } = $modal.getRefMaps()
            const elem = refElem.value
            const chartElem: HTMLDivElement | null = elem ? elem.querySelector('.vxe-chart--wrapper') : null
            if (chartElem) {
              const $chart = (globalEcharts || (window as any).echarts).init(chartElem)
              $chart.setOption(getOptions(params))
              cmItem.$chart = $chart
            }
          },
          onHide (evntParams) {
            const { $modal } = evntParams
            XEUtils.remove(_chartModals, item => item.id === $modal.props.id)
            if (cmItem.$chart) {
              cmItem.$chart.dispose()
              cmItem.$chart = null
            }
          },
          onZoom () {
            if (cmItem.$chart) {
              cmItem.$chart.resize()
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

const menuMap = {
  CHART_BAR_X_AXIS: createChartModal((params) => {
    const { $table, menu } = params
    const cellAreas = $table.getCellAreas()
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
      data: rows.map((row) => XEUtils.get(row, categoryColumn.field))
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
        data: rows.map((row) => XEUtils.get(row, column.field))
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
    const cellAreas = $table.getCellAreas()
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
      data: rows.map((row) => XEUtils.get(row, categoryColumn.field))
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
        data: rows.map((row) => XEUtils.get(row, column.field))
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
    const cellAreas = $table.getCellAreas()
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
      data: rows.map((row) => XEUtils.get(row, categoryColumn.field))
    }
    serieColumns.forEach((column) => {
      legendOpts.data.push(column.title)
      seriesOpts.push({
        name: column.title,
        type: 'line',
        data: rows.map((row) => XEUtils.get(row, column.field))
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
    const cellAreas = $table.getCellAreas()
    const { rows, cols } = cellAreas[0]
    const { params: chartParams = {} } = menu
    const { category } = chartParams
    const categoryColumn = $table.getColumnByField(category) || cols[0]
    const serieColumns = cols.filter((column) => column.field !== categoryColumn.field)
    const serieColumn = serieColumns[0]
    const legendData = rows.map((row) => XEUtils.get(row, categoryColumn.field))
    const seriesData: any[] = []
    rows.forEach((row) => {
      seriesData.push({
        name: XEUtils.get(row, categoryColumn.field),
        value: XEUtils.get(row, serieColumn.field)
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
        const cellAreas = $table.getCellAreas()
        const validArea = cellAreas.length === 1
        item.disabled = !validArea
        if (validArea) {
          const { rows, cols } = cellAreas[0]
          const { category } = chartParams
          switch (code) {
            case 'CHART_BAR_X_AXIS':
            case 'CHART_BAR_Y_AXIS':
            case 'CHART_LINE': {
              if (category) {
                const serieColumns = cols.filter((column) => column.field !== category)
                item.disabled = !rows.length || serieColumns.length < 1
              } else {
                item.disabled = !rows.length || cols.length < 2
              }
              break
            }
            case 'CHART_PIE': {
              if (category) {
                const serieColumns = cols.filter((column) => column.field !== category)
                item.disabled = !rows.length || serieColumns.length !== 1
              } else {
                item.disabled = !rows.length || cols.length !== 2
              }
              break
            }
          }
        }
      }
      break
    }
  }
}

function handleBeforeDestroyEvent (params: VxeGlobalInterceptorHandles.InterceptorParams) {
  const { $table } = params
  const { internalData } = $table
  const { _chartModals } = internalData
  if (_chartModals && VxeUI.modal) {
    _chartModals.slice(0).reverse().forEach((item) => {
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
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[plugin-render-antd 4.x] Version 4.x is required')
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
