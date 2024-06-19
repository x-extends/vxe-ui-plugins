# @vxe-ui/plugin-renderer

[Vxe UI](https://vxeui.com/) plug-in, provides some common renderers.

## Compatibility

It corresponds to [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install vxe-pc-ui @vxe-ui/plugin-renderer
```

```javascript
// ...
import { VxeUI } from 'vxe-pc-ui'
import VxeUIPluginRenderer from '@vxe-ui/plugin-renderer'
import '@vxe-ui/plugin-renderer/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderer)
```

## API

### bar 柱状图

#### bar Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| bar.width | 柱子宽度 | number,string | — | — |
| bar.max | 柱子最大值 | number | — | — |
| colors | 柱子颜色列表 | string[] | — | — |
| tooltip.formatter | 提示内容格式 | string | — | — |
| label.color | 显示值的颜色 | string | — | — |
| label.formatter | 显示值的格式（{row, value}） | string | — | — |

### pie 饼图

#### pie Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| diameter | 饼图直径 | number,string | — | — |
| margin | 饼图间距 | number,string | — | 1px |
| colors | 扇区的颜色列表 | string[] | — | — |
| tooltip.formatter | 提示内容格式 | string | — | — |
| ring.diameter| 内圆直径 | number,string | — | — |
| ring.color | 内圆的颜色 | string | — | — |
| label.color | 显示值的颜色 | string | — | — |
| label.formatter | 显示值的格式（{row, value}） | string | — | — |

## Demo

```html
<vxe-table
  border
  show-overflow
  height="400"
  :data="tableData">
  <vxe-column type="checkbox" width="60"></vxe-column>
  <vxe-column field="name" width="200"></vxe-column>
  <vxe-column field="num1" title="Bar" :cell-render="{name: 'bar'}"></vxe-column>
  <vxe-column field="num2" title="Ring" :cell-render="{name: 'pie'}"></vxe-column>
  <vxe-column field="num3" title="Rate" :cell-render="{name: 'rate'}"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test1', num1: [30, 47], num2: [60, 36, 36], num3: 3 },
        { id: 101, name: 'test2', num1: [15, 22], num2: [85, 22, 97], num3: 1 },
        { id: 102, name: 'test3', num1: [75, 36], num2: [45, 84, 66], num3: 5 }
      ]
    }
  }
}
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
