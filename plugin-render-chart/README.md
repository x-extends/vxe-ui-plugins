# @vxe-ui/plugin-render-chart

[Vxe UI](https://vxeui.com/) plug-in, support for rendering simple charts.

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-render-chart
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginRenderChart from '@vxe-ui/plugin-render-chart'
import '@vxe-ui/plugin-render-chart/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderChart)
```

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
