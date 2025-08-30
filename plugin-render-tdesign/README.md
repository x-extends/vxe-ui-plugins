# @vxe-ui/plugin-render-tdesign

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [tdesign-vue-next](https://www.npmjs.com/package/tdesign-vue-next) component.

## Compatibility

It corresponds to [vxe-table v4](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-render-tdesign
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginRenderTDesign from '@vxe-ui/plugin-render-tdesign'
import '@vxe-ui/plugin-render-tdesign/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderTDesign)
```

## Import on-demand

```shell
npm install @vxe-ui/plugin-render-tdesign
```

```javascript
// ...
import VxeUIPluginRenderTDesign from '@vxe-ui/plugin-render-tdesign'
// ...

// If it is not a global installation, then a single import is required.
import { Button as TButton, AInput as TInput, ASelect as TSelect } from 'tdesign-vue-next';
// ...
VxeUIPluginRenderTDesign.component(TButton)
VxeUIPluginRenderTDesign.component(TInput)
VxeUIPluginRenderTDesign.component(TSelect)
```

## API

### cell-render 默认的渲染配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | TlInput, TAutocomplete, TInputNumber | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### edit-render 可编辑渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | TInput, TAutocomplete, TInputNumber | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### filter-render 筛选渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | TInput, TInputNumber, TAutocomplete | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

### item-render 表单-项渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | TInput, TInputNumber, TAutocomplete | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

## Table Cell demo

```html
<template>
  <vxe-table
    height="600"
    :data="tableData"
    :edit-config="{trigger: 'click', mode: 'cell'}">
    <vxe-column field="name" title="Name" :edit-render="{name: 'TInput'}"></vxe-column>
    <vxe-column field="age" title="Age" :edit-render="{name: 'TInputNumber'}"></vxe-column>
  </vxe-table>
</template>

<script>
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test0', age: 28, sex: '1', date: '' },
        { id: 101, name: 'test1', age: 32, sex: '0', date: '' },
        { id: 102, name: 'test2', age: 36, sex: '1', date: '' }
      ]
    }
  }
}
</script>
```

## Table Filter demo

```html
<template>
  <vxe-table
    height="600"
    :data="tableData">
    <vxe-column field="name" title="Name":filters="nameOptions" :filter-render="{name: 'TInput'}"></vxe-column>
    <vxe-column field="age" title="Age"></vxe-column>
    <vxe-column field="date" title="Date" ></vxe-column>
  </vxe-table>
</template>

<script>
export default {
  data () {
    return {
      nameOptions: [
        { data: '' }
      ],
      tableData: [
        { id: 100, name: 'test0', age: 28, date: null },
        { id: 101, name: 'test1', age: 32, date: null },
        { id: 102, name: 'test2', age: 36, date: null }
      ]
    }
  }
}
</script>
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
