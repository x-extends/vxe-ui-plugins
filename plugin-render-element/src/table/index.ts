import { h, ComponentOptions } from 'vue'
import { getCurrComponent } from '../util/comp'
import XEUtils from 'xe-utils'
import dayjs from 'dayjs'

import type { VxeUIExport, VxeGlobalRendererHandles } from 'vxe-pc-ui'
import type { VxeTableDefines, VxeColumnPropTypes } from 'vxe-table'

/**
 * 表格 - 渲染器
 */
export function defineTableRender (VxeUI: VxeUIExport) {
  function isEmptyValue (cellValue: any) {
    return cellValue === null || cellValue === undefined || cellValue === ''
  }

  function getOnName (type: string) {
    return 'on' + type.substring(0, 1).toLocaleUpperCase() + type.substring(1)
  }

  function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'modelValue'
  }

  function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    return 'update:modelValue'
  }

  function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
    let type = 'change'
    switch (renderOpts.name) {
      case 'ElAutocomplete':
        type = 'select'
        break
      case 'ElInput':
      case 'ElInputNumber':
        type = 'input'
        break
    }
    return type
  }

  function toDayStringDate (value: any, format: string) {
    return dayjs(value, format).toDate()
  }

  function toDayDateString (date: any, format: string) {
    return dayjs(date).format(format)
  }

  function parseDate (value: any, props: { [key: string]: any }) {
    return value && props.valueFormat ? toDayStringDate(value, props.valueFormat) : value
  }

  function getFormatDate (value: any, props: { [key: string]: any }, defaultFormat: string) {
    return value ? toDayDateString(parseDate(value, props), props.format || props.valueFormat || defaultFormat) : value
  }

  function getFormatDates (values: any[], props: { [key: string]: any }, separator: string, defaultFormat: string) {
    return XEUtils.map(values, (date: any) => getFormatDate(date, props, defaultFormat)).join(separator)
  }

  function equalDateRange (cellValue: any, data: any, props: { [key: string]: any }, defaultFormat: string) {
    cellValue = getFormatDate(cellValue, props, defaultFormat)
    return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
  }

  function getCellEditFilterProps (renderOpts: any, params: VxeGlobalRendererHandles.RenderEditParams | VxeGlobalRendererHandles.RenderFilterParams, value: any, defaultProps?: { [prop: string]: any }) {
    return XEUtils.assign({}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
  }

  function formatText (cellValue: any) {
    return '' + (isEmptyValue(cellValue) ? '' : cellValue)
  }

  function getCellLabelVNs (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderCellParams, cellLabel: any) {
    const { placeholder } = renderOpts
    return [
      h('span', {
        class: 'vxe-cell--label'
      }, placeholder && isEmptyValue(cellLabel)
        ? [
            h('span', {
              class: 'vxe-cell--placeholder'
            }, formatText(VxeUI.getI18n(placeholder)))
          ]
        : formatText(cellLabel))
    ]
  }

  function getOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderParams, inputFunc?: Function, changeFunc?: Function) {
    const { events } = renderOpts
    const modelEvent = getModelEvent(renderOpts)
    const changeEvent = getChangeEvent(renderOpts)
    const isSameEvent = changeEvent === modelEvent
    const ons: { [type: string]: Function } = {}
    XEUtils.objectEach(events, (func: Function, key: string) => {
      ons[getOnName(key)] = function (...args: any[]) {
        func(params, ...args)
      }
    })
    if (inputFunc) {
      ons[getOnName(modelEvent)] = function (targetEvnt: any) {
        inputFunc(targetEvnt)
        if (events && events[modelEvent]) {
          events[modelEvent](params, targetEvnt)
        }
        if (isSameEvent && changeFunc) {
          changeFunc(targetEvnt)
        }
      }
    }
    if (!isSameEvent && changeFunc) {
      ons[getOnName(changeEvent)] = function (...args: any[]) {
        changeFunc(...args)
        if (events && events[changeEvent]) {
          events[changeEvent](params, ...args)
        }
      }
    }
    return ons
  }

  function getEditOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderEditParams) {
    const { $table, row, column } = params
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      XEUtils.set(row, column.field, value)
    }, () => {
    // 处理 change 事件相关逻辑
      $table.updateStatus(params)
    })
  }

  function getFilterOns (renderOpts: any, params: VxeGlobalRendererHandles.RenderFilterParams, option: VxeTableDefines.FilterOption, changeFunc: Function) {
    return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
      option.data = value
    }, changeFunc)
  }

  function matchCascaderData (index: number, list: any[], values: any[], labels: any[]) {
    const val = values[index]
    if (list && values.length > index) {
      XEUtils.each(list, (item) => {
        if (item.value === val) {
          labels.push(item.label)
          matchCascaderData(++index, item.children, values, labels)
        }
      })
    }
  }

  function getSelectCellValue (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderCellParams) {
    const { options = [], optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = renderOpts
    const { $table, rowid, row, column } = params
    const { filterable, multiple } = props
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    const groupOptions = optionGroupProps.options || 'options'
    const cellValue = XEUtils.get(row, column.field)
    const colid = column.id
    let cellData: any
    if (filterable) {
      const { internalData } = $table
      const { fullAllDataRowIdData } = internalData
      const rest: any = fullAllDataRowIdData[rowid]
      if (rest) {
        cellData = rest.cellData
        if (!cellData) {
          cellData = rest.cellData = {}
        }
      }
      if (rest && cellData[colid] && cellData[colid].value === cellValue) {
        return cellData[colid].label
      }
    }
    if (!isEmptyValue(cellValue)) {
      const selectlabel = XEUtils.map(multiple ? cellValue : [cellValue], optionGroups
        ? (value) => {
            let selectItem: any
            for (let index = 0; index < optionGroups.length; index++) {
              selectItem = XEUtils.find(optionGroups[index][groupOptions], (item) => item[valueProp] === value)
              if (selectItem) {
                break
              }
            }
            return selectItem ? selectItem[labelProp] : value
          }
        : (value) => {
            const selectItem = XEUtils.find(options, (item) => item[valueProp] === value)
            return selectItem ? selectItem[labelProp] : value
          }).join(', ')
      if (cellData && options && options.length) {
        cellData[colid] = { value: cellValue, label: selectlabel }
      }
      return selectlabel
    }
    return ''
  }

  function getCascaderCellValue (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderCellParams) {
    const { props = {} } = renderOpts
    const { row, column } = params
    const cellValue = XEUtils.get(row, column.field)
    const values: any[] = cellValue || []
    const labels: any[] = []
    matchCascaderData(0, props.options, values, labels)
    return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `)
  }

  function getDatePickerCellValue (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderCellParams | VxeGlobalRendererHandles.ExportMethodParams) {
    const { props = {} } = renderOpts
    const { row, column } = params
    const { rangeSeparator = '-' } = props
    let cellValue = XEUtils.get(row, column.field)
    switch (props.type) {
      case 'week':
        cellValue = getFormatDate(cellValue, props, 'YYYYwWW')
        break
      case 'month':
        cellValue = getFormatDate(cellValue, props, 'YYYY-MM')
        break
      case 'year':
        cellValue = getFormatDate(cellValue, props, 'YYYY')
        break
      case 'dates':
        cellValue = getFormatDates(cellValue, props, ', ', 'YYYY-MM-DD')
        break
      case 'daterange':
        cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'YYYY-MM-DD')
        break
      case 'datetimerange':
        cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'YYYY-MM-DD HH:ss:mm')
        break
      case 'monthrange':
        cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'YYYY-MM')
        break
      default:
        cellValue = getFormatDate(cellValue, props, 'YYYY-MM-DD')
    }
    return cellValue
  }

  function getTimePickerCellValue (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderCellParams | VxeGlobalRendererHandles.RenderEditParams) {
    const { props = {} } = renderOpts
    const { row, column } = params
    const { isRange, format = 'HH:mm:ss', rangeSeparator = '-' } = props
    let cellValue = XEUtils.get(row, column.field)
    if (cellValue && isRange) {
      cellValue = XEUtils.map(cellValue, (date) => toDayDateString(parseDate(date, props), format)).join(` ${rangeSeparator} `)
    }
    return toDayDateString(parseDate(cellValue, props), format)
  }

  function createEditRender (defaultProps?: { [key: string]: any }) {
    return function (renderOpts: VxeColumnPropTypes.EditRender & { name: string }, params: VxeGlobalRendererHandles.RenderEditParams) {
      const { row, column } = params
      const { name, attrs } = renderOpts
      const cellValue = XEUtils.get(row, column.field)
      return [
        h(getCurrComponent(name), {
          ...attrs,
          ...getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
          ...getEditOns(renderOpts, params)
        })
      ]
    }
  }

  function defaultButtonEditRender (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderEditParams) {
    const { attrs } = renderOpts
    return [
      h(getCurrComponent('el-button'), {
        ...attrs,
        ...getCellEditFilterProps(renderOpts, params, null),
        ...getOns(renderOpts, params)
      }, cellText(renderOpts.content))
    ]
  }

  function defaultButtonsEditRender (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderEditParams) {
    const { children } = renderOpts
    if (children) {
      return children.map((childRenderOpts: VxeColumnPropTypes.EditRender) => defaultButtonEditRender(childRenderOpts, params)[0])
    }
    return []
  }

  function createFilterRender (defaultProps?: { [key: string]: any }) {
    return function (renderOpts: VxeColumnPropTypes.FilterRender & { name: string }, params: VxeGlobalRendererHandles.RenderFilterParams) {
      const { column } = params
      const { name, attrs } = renderOpts
      return [
        h('div', {
          class: 'vxe-table--filter-element-wrapper'
        }, column.filters.map((option, oIndex) => {
          const optionValue = option.data
          return h(getCurrComponent(name), {
            key: oIndex,
            ...attrs,
            ...getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
            ...getFilterOns(renderOpts, params, option, () => {
            // 处理 change 事件相关逻辑
              handleConfirmFilter(params, !!option.data, option)
            })
          })
        }))
      ]
    }
  }

  function handleConfirmFilter (params: VxeGlobalRendererHandles.RenderFilterParams, checked: boolean, option: VxeTableDefines.FilterOption) {
    const { $panel } = params
    $panel.changeOption(null, checked, option)
  }

  /**
   * 模糊匹配
   * @param params
   */
  function defaultFuzzyFilterMethod (params: VxeGlobalRendererHandles.FilterMethodParams) {
    const { option, row, column } = params
    const { data } = option
    const cellValue = XEUtils.get(row, column.field)
    return XEUtils.toValueString(cellValue).indexOf(data) > -1
  }

  /**
   * 精确匹配
   * @param params
   */
  function defaultExactFilterMethod (params: VxeGlobalRendererHandles.FilterMethodParams) {
    const { option, row, column } = params
    const { data } = option
    const cellValue = XEUtils.get(row, column.field)
    /* eslint-disable eqeqeq */
    return cellValue === data
  }

  function renderOptions (options: any[], optionProps: VxeGlobalRendererHandles.RenderOptionProps) {
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    return XEUtils.map(options, (item, oIndex) => {
      return h(getCurrComponent('el-option'), {
        key: oIndex,
        value: item[valueProp],
        label: item[labelProp],
        disabled: item.disabled
      })
    })
  }

  function cellText (cellValue: any): string[] {
    return [formatText(cellValue)]
  }

  function createExportMethod (getExportCellValue: Function) {
    return function (params: VxeGlobalRendererHandles.ExportMethodParams) {
      const { row, column, options } = params
      return options && options.original ? XEUtils.get(row, column.field) : getExportCellValue(column.editRender || column.cellRender, params)
    }
  }

  VxeUI.renderer.mixin({
    ElAutocomplete: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultExactFilterMethod
    },
    ElInput: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultFuzzyFilterMethod
    },
    ElInputNumber: {
      tableAutoFocus: 'input',
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultFuzzyFilterMethod
    },
    ElSelect: {
      renderTableEdit (renderOpts, params) {
        const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
        const { row, column } = params
        const { attrs } = renderOpts
        const cellValue = XEUtils.get(row, column.field)
        const props = getCellEditFilterProps(renderOpts, params, cellValue)
        const ons = getEditOns(renderOpts, params)
        if (optionGroups) {
          const groupOptions = optionGroupProps.options || 'options'
          const groupLabel = optionGroupProps.label || 'label'
          return [
            h(getCurrComponent('el-select') as ComponentOptions, {
              ...attrs,
              ...props,
              ...ons
            }, {
              default: () => {
                return XEUtils.map(optionGroups, (group, gIndex) => {
                  return h(getCurrComponent('el-option-group') as ComponentOptions, {
                    key: gIndex,
                    label: group[groupLabel]
                  }, {
                    default: () => renderOptions(group[groupOptions], optionProps)
                  })
                })
              }
            })
          ]
        }
        return [
          h(getCurrComponent('el-select') as ComponentOptions, {
            ...props,
            ...attrs,
            ...ons
          }, {
            default: () => renderOptions(options, optionProps)
          })
        ]
      },
      renderTableCell (renderOpts, params) {
        return getCellLabelVNs(renderOpts, params, getSelectCellValue(renderOpts, params))
      },
      renderTableFilter (renderOpts, params) {
        const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
        const groupOptions = optionGroupProps.options || 'options'
        const groupLabel = optionGroupProps.label || 'label'
        const { column } = params
        const { attrs } = renderOpts
        return [
          h('div', {
            class: 'vxe-table--filter-element-wrapper'
          }, optionGroups
            ? column.filters.map((option, oIndex) => {
              const optionValue = option.data
              const props = getCellEditFilterProps(renderOpts, params, optionValue)
              return h(getCurrComponent('el-select') as ComponentOptions, {
                key: oIndex,
                ...attrs,
                ...props,
                ...getFilterOns(renderOpts, params, option, () => {
                // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                })
              }, {
                default: () => {
                  return XEUtils.map(optionGroups, (group, gIndex) => {
                    return h(getCurrComponent('el-option-group') as ComponentOptions, {
                      key: gIndex,
                      label: group[groupLabel]
                    }, {
                      default: () => renderOptions(group[groupOptions], optionProps)
                    })
                  })
                }
              })
            })
            : column.filters.map((option, oIndex) => {
              const optionValue = option.data
              const props = getCellEditFilterProps(renderOpts, params, optionValue)
              return h(getCurrComponent('el-select') as ComponentOptions, {
                key: oIndex,
                ...attrs,
                ...props,
                ...getFilterOns(renderOpts, params, option, () => {
                  // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                })
              }, {
                default: () => renderOptions(options, optionProps)
              })
            }))
        ]
      },
      tableFilterDefaultMethod (params) {
        const { option, row, column } = params
        const { data } = option
        const { field, filterRender: renderOpts } = column
        const { props = {} } = renderOpts
        const cellValue = XEUtils.get(row, field)
        if (props.multiple) {
          if (XEUtils.isArray(cellValue)) {
            return XEUtils.includeArrays(cellValue, data)
          }
          return data.indexOf(cellValue) > -1
        }
        /* eslint-disable eqeqeq */
        return cellValue == data
      },
      tableExportMethod: createExportMethod(getSelectCellValue)
    },
    ElCascader: {
      renderTableEdit: createEditRender(),
      renderTableCell (renderOpts, params) {
        return getCellLabelVNs(renderOpts, params, getCascaderCellValue(renderOpts, params))
      },
      tableExportMethod: createExportMethod(getCascaderCellValue)
    },
    ElDatePicker: {
      renderTableEdit: createEditRender(),
      renderTableCell (renderOpts, params) {
        return getCellLabelVNs(renderOpts, params, getDatePickerCellValue(renderOpts, params))
      },
      renderTableFilter (renderOpts, params) {
        const { column } = params
        const { name, attrs } = renderOpts
        return [
          h('div', {
            class: 'vxe-table--filter-element-wrapper'
          }, column.filters.map((option, oIndex) => {
            const optionValue = option.data
            return h(getCurrComponent(name as string), {
              key: oIndex,
              ...attrs,
              ...getCellEditFilterProps(renderOpts, params, optionValue),
              ...getFilterOns(renderOpts, params, option, () => {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, !!option.data, option)
              })
            })
          }))
        ]
      },
      tableFilterDefaultMethod (params) {
        const { option, row, column } = params
        const { data } = option
        const { filterRender: renderOpts } = column
        const { props = {} } = renderOpts
        const cellValue = XEUtils.get(row, column.field)
        if (data) {
          switch (props.type) {
            case 'daterange':
              return equalDateRange(cellValue, data, props, 'YYYY-MM-DD')
            case 'datetimerange':
              return equalDateRange(cellValue, data, props, 'YYYY-MM-DD HH:ss:mm')
            case 'monthrange':
              return equalDateRange(cellValue, data, props, 'YYYY-MM')
            default:
              return cellValue === data
          }
        }
        return false
      },
      tableExportMethod: createExportMethod(getDatePickerCellValue)
    },
    ElTimePicker: {
      renderTableEdit: createEditRender(),
      renderTableCell (renderOpts, params) {
        return getCellLabelVNs(renderOpts, params, getTimePickerCellValue(renderOpts, params))
      },
      tableExportMethod: createExportMethod(getTimePickerCellValue)
    },
    ElTimeSelect: {
      renderTableEdit: createEditRender()
    },
    ElRate: {
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultExactFilterMethod
    },
    ElSwitch: {
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter (renderOpts, params) {
        const { column } = params
        const { name, attrs } = renderOpts
        return [
          h('div', {
            class: 'vxe-table--filter-element-wrapper'
          }, column.filters.map((option, oIndex) => {
            const optionValue = option.data
            return h(getCurrComponent(name as string), {
              key: oIndex,
              ...attrs,
              ...getCellEditFilterProps(renderOpts, params, optionValue),
              ...getFilterOns(renderOpts, params, option, () => {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, XEUtils.isBoolean(option.data), option)
              })
            })
          }))
        ]
      },
      tableFilterDefaultMethod: defaultExactFilterMethod
    },
    ElSlider: {
      renderTableDefault: createEditRender(),
      renderTableEdit: createEditRender(),
      renderTableFilter: createFilterRender(),
      tableFilterDefaultMethod: defaultExactFilterMethod
    },
    ElButton: {
      renderTableDefault: defaultButtonEditRender
    },
    ElButtons: {
      renderTableDefault: defaultButtonsEditRender
    }
  })
}
