# @vxe-ui/plugin-render-echarts

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [echarts](https://www.npmjs.com/package/echarts).

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @@vxe-ui/plugin-render-echarts echarts
```

```javascript
// ...
import VXETable from 'vxe-table'
import echarts from 'echarts'
import VxeUIPluginRenderEcharts from '@vxe-ui/plugin-render-echarts'
import '@vxe-ui/plugin-render-echarts/dist/style.css'
// ...

// 方式1：NPM 安装，注入 echarts 对象
VXETable.use(VxeUIPluginRenderEcharts, {
  echarts
})

// 方式2：CDN 安装，只要确保 window.echarts 存在即可
// VXETable.use(VxeUIPluginRenderEcharts)
```

## API

### Context menu codes

| code 编码 | describe 描述 | params 参数 |
|------|------|------|
| CHART_BAR_X_AXIS | 横向柱状图（如果设置了类别 category 则 series 至少一列，否则 series 至少两列） | {category?: field} |
| CHART_BAR_Y_AXIS  | 纵向柱状图（如果设置了类别 category 则 series 至少一列，否则 series 至少两列） | {category?: field} |
| CHART_LINE  | 折线图（如果设置了类别 category 则 series 至少一列，否则 series 至少两列） | {category?: field} |
| CHART_PIE  | 饼图（如果设置了类别 category 则 series 只需一列，否则 series 需要两列） | {category?: field} |

## Demo

```html
<vxe-table
  height="500"
  :data="tableData"
  :mouse-config="{ area: true }"
  :menu-config="menuConfig"
  :edit-config="{trigger: 'dblclick', mode: 'cell'}">
  <vxe-column type="seq" width="60"></vxe-column>
  <vxe-column field="nickname" title="Nickname" :edit-render="{name: 'input'}"></vxe-column>
  <vxe-column field="sex" title="sex" :edit-render="{name: 'input'}"></vxe-column>
  <vxe-column field="age" title="Age" :edit-render="{name: 'input'}"></vxe-column>
  <vxe-column field="rate" title="Rate" :edit-render="{name: 'input'}"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'Test1', nickname: 'Nickname1', sex: '1', age: 26, rate: '3' },
        { id: 100, name: 'Test2', nickname: 'Nickname2', sex: '0', age: 28, rate: '5' }
      ],
      menuConfig: {
        body: {
          options: [
            { code: 'CHART_LINE', name: '折线图' }
          ]
        }
      }
    }
  }
}
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
