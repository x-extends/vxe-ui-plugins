import { h, VNode } from 'vue'
import XEUtils from 'xe-utils'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'

let VxeUI: VxeUIExport

const defaultColors = ['#2F4554', '#C23531', '#61A0A8', '#D48265', '#91C7AE', '#749F83', '#CA8622', '#006699', '#BDA29A', '#546570']
const tmplOpts = { tmplRE: /\{([.\w[\]\s]+)\}/g }

function getDefaultColor (index: number) {
  return defaultColors[index % 10]
}

function toRGBLight (color: string, level: number) {
  const rgbs = color.match(/(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(,\s?(\d{1,3}))?/)
  if (rgbs) {
    const r = parseInt(rgbs[1])
    const g = parseInt(rgbs[2])
    const b = parseInt(rgbs[3])
    const alpha = parseInt(rgbs[5])
    return `rgb(${r + level},${g + level},${b + level}${alpha ? `,${alpha}` : ''})`
  }
  return null
}

function getStyleUnit (val?: number | string) {
  return XEUtils.isNumber(val) ? `${val}px` : val
}

function showTooltip (elem: HTMLElement, params: VxeGlobalRendererHandles.RenderTableDefaultParams, formatter: string, value: any) {
  const { row, column, $table } = params
  const content = XEUtils.isString(formatter) ? XEUtils.template(formatter, { value, row, column }, tmplOpts) : null
  $table.openTooltip(elem, content || '')
}

function hideTooltip (elem: HTMLElement, params: VxeGlobalRendererHandles.RenderTableDefaultParams) {
  const { $table } = params
  if ($table) {
    $table.closeTooltip()
  }
}

function createBarVNs (params: VxeGlobalRendererHandles.RenderTableDefaultParams, renderOpts: VxeGlobalRendererHandles.RenderTableDefaultOptions) {
  const { row, column } = params
  const { props = {} } = renderOpts
  const { margin, colors = [], bar = {}, label: barLabel = {}, tooltip = {} } = props
  const { max } = bar
  const barHeight = getStyleUnit(bar.width)
  let cellValue = row[column.field] as any[]
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  const numList: number[] = []
  let maxVal = 0
  cellValue.forEach((num) => {
    num = XEUtils.toNumber(num)
    maxVal = Math.max(maxVal, num)
    numList.push(num)
  })
  const ratio = Math.max(XEUtils.toNumber(max), maxVal) / 100
  const barList = numList.map(num => parseInt(`${num / ratio}`))
  return barList.map((barValue, index) => {
    let labelPosition
    if (barValue < 30) {
      labelPosition = 'outer'
    } else if (barValue > 70) {
      labelPosition = 'inner'
    }
    return h('span', {
      class: ['vxe-renderer-bar', {
        [`label--${labelPosition}`]: labelPosition
      }],
      style: {
        margin: getStyleUnit(margin),
        height: barHeight,
        lineHeight: barHeight
      }
    }, [
      h('span', {
        class: 'vxe-renderer-bar--chart',
        style: {
          width: `${barValue}%`,
          backgroundColor: colors[index] || getDefaultColor(index)
        },
        onMouseenter (evnt: MouseEvent) {
          const elem = evnt.currentTarget as HTMLSpanElement
          const hoverColor = toRGBLight(elem.style.backgroundColor, 10)
          if (hoverColor) {
            elem.style.backgroundColor = hoverColor
          }
          if (tooltip.formatter) {
            showTooltip(elem, params, tooltip.formatter, numList[index])
          }
        },
        onMouseleave (evnt: MouseEvent) {
          const elem = evnt.currentTarget as HTMLSpanElement
          const reColor = colors[index] || getDefaultColor(index)
          elem.style.backgroundColor = reColor
          hideTooltip(elem, params)
        }
      }),
      h('span', {
        class: 'vxe-renderer-bar--label',
        style: {
          color: barLabel.color
        }
      }, XEUtils.isString(barLabel.formatter) ? XEUtils.template(barLabel.formatter, { value: numList[index], row, column }, tmplOpts) : '')
    ])
  })
}

interface PieBlockItem {
  val: number;
  deg: number;
  index: number;
}

function parsePieAreas (blockList: PieBlockItem[], total: number) {
  const prves: PieBlockItem[] = []
  const nexts: PieBlockItem[] = []
  let countDeg = 0
  const ratio = total / 360
  blockList.forEach((item) => {
    item.deg = countDeg
    countDeg += parseInt(`${item.val / ratio}`)
    if (countDeg > 180 && item.deg <= 180) {
      const repairItem = Object.assign({}, item)
      prves.push(repairItem)
      item.deg = 180
    }
    if (countDeg > 180) {
      nexts.push(item)
    } else {
      prves.push(item)
    }
  })
  return { prves, nexts }
}

function createPieVNs (params: VxeGlobalRendererHandles.RenderTableDefaultParams, renderOptList: VxeGlobalRendererHandles.RenderTableDefaultOptions[], cellValue: any[]) {
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  return renderOptList.map((renderOpts, renderIndex) => {
    const { row, column } = params
    const { props = {} } = renderOpts
    const { margin, colors = [], ring = {}, label: ringLabel = {}, tooltip = {} } = props
    let pieVals = cellValue[renderIndex] as any[]
    const pieDiameter = getStyleUnit(props.diameter)
    const ringDiameter = getStyleUnit(ring.diameter)
    const blockList: PieBlockItem[] = []
    let countVal = 0
    if (!XEUtils.isArray(pieVals)) {
      pieVals = [pieVals]
    }
    pieVals.forEach((val, index) => {
      val = XEUtils.toNumber(val)
      countVal += val
      blockList.push({ val, deg: 0, index })
    })
    const { prves: prveList, nexts: nextList } = parsePieAreas(blockList, countVal)
    const blockOns = {
      onMouseenter (evnt: MouseEvent) {
        const elem = evnt.currentTarget as HTMLSpanElement & { parentNode: HTMLSpanElement & { parentNode: HTMLSpanElement } }
        const index = XEUtils.toNumber(elem.getAttribute('block'))
        const hoverColor = toRGBLight(elem.style.backgroundColor, 10)
        if (hoverColor) {
          XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), elem => {
            (elem as HTMLElement).style.backgroundColor = hoverColor
          })
        }
        if (tooltip.formatter) {
          showTooltip(elem, params, tooltip.formatter, blockList[index].val)
        }
      },
      onMouseleave (evnt: MouseEvent) {
        const elem = evnt.currentTarget as HTMLSpanElement & { parentNode: HTMLSpanElement & { parentNode: HTMLSpanElement } }
        const index = XEUtils.toNumber(elem.getAttribute('block'))
        const reColor = colors[index] || getDefaultColor(index)
        XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), elem => {
          (elem as HTMLElement).style.backgroundColor = reColor
        })
        hideTooltip(elem, params)
      }
    }

    const pieVNs = [
      h('span', {
        class: 'vxe-renderer-pie--next-half'
      }, nextList.map((item) => {
        return h('span', {
          class: ['vxe-renderer-pie--block', `block-${item.index}`],
          style: {
            backgroundColor: colors[item.index] || getDefaultColor(item.index),
            transform: `rotate(${item.deg - 180}deg)`
          },
          block: item.index,
          ...blockOns
        })
      })),
      h('span', {
        class: 'vxe-renderer-pie--prve-half'
      }, prveList.map((item) => {
        return h('span', {
          class: ['vxe-renderer-pie--block', `block-${item.index}`],
          style: {
            backgroundColor: colors[item.index] || getDefaultColor(item.index),
            transform: `rotate(${item.deg}deg)`
          },
          block: item.index,
          ...blockOns
        })
      }))
    ]

    if (ringDiameter) {
      pieVNs.push(
        h('span', {
          class: 'vxe-renderer-pie--ring-bg',
          style: {
            width: ringDiameter,
            height: ringDiameter,
            backgroundColor: ring.color
          }
        }),
        h('span', {
          class: 'vxe-renderer-pie--ring-label',
          style: {
            color: ringLabel.color
          }
        }, XEUtils.isString(ringLabel.formatter) ? XEUtils.template(ringLabel.formatter, { value: row[column.field] || [], row, column }, tmplOpts) : '')
      )
    }

    return h('span', {
      class: 'vxe-renderer-pie',
      style: {
        margin: getStyleUnit(margin),
        width: pieDiameter,
        height: pieDiameter
      }
    }, pieVNs)
  })
}

export const VxeUIPluginRenderChart = {
  install (core: VxeUIExport) {
    VxeUI = core

    // 检查版本
    if (!/^(4)\./.test(VxeUI.uiVersion)) {
      console.error('[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE')
    }

    VxeUI.renderer.mixin({
      bar: {
        renderDefault (renderOpts, params) {
          return createBarVNs(params, renderOpts)
        }
      },
      pie: {
        renderDefault (renderOpts, params) {
          const { row, column } = params
          const cellValue = row[column.field]
          return createPieVNs(params, [renderOpts], cellValue ? [cellValue] : [])
        }
      },
      pies: {
        renderDefault (renderOpts, params) {
          const { row, column } = params
          const cellValue = row[column.field]
          return createPieVNs(params, renderOpts.children || [], cellValue)
        }
      },
      rate: {
        renderDefault (renderOpts, params) {
          const { row, column } = params
          const { props = {} } = renderOpts
          const { colors = [] } = props
          const cellValue = XEUtils.toNumber(row[column.field])
          const rateVNs: VNode[] = []
          let lastColor: string
          XEUtils.range(0, XEUtils.toNumber(props.count) || 5).forEach((obj, index) => {
            const itemIndex = index + 1
            const isActive = cellValue >= itemIndex
            let itemColor: string
            if (cellValue >= itemIndex) {
              if (colors[itemIndex]) {
                lastColor = colors[itemIndex]
              }
              itemColor = lastColor || '#F7BA2A'
            } else {
              itemColor = colors[0] || '#E9E9E9'
            }
            const itemOns = isActive
              ? {
                  onMouseenter (evnt: MouseEvent) {
                    const elem = evnt.currentTarget as HTMLSpanElement
                    const hoverColor = toRGBLight(elem.style.color, 10)
                    if (hoverColor) {
                      elem.style.color = hoverColor
                    }
                  },
                  onMouseleave (evnt: MouseEvent) {
                    const elem = evnt.currentTarget as HTMLSpanElement
                    elem.style.color = itemColor
                  }
                }
              : {}
            rateVNs.push(
              h('span', {
                class: 'vxe-renderer-rate-item',
                style: {
                  color: itemColor
                },
                ...itemOns
              })
            )
          })
          return [
            h('div', {
              class: 'vxe-renderer-rate'
            }, rateVNs)
          ]
        }
      }
    })
  }
}

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
  window.VxeUI.use(VxeUIPluginRenderChart)
}

export default VxeUIPluginRenderChart
