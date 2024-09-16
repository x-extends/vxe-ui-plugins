# @vxe-ui/plugin-export-xlsx

[Vxe UI](https://vxeui.com/) plug-in supports xlsx file export. use [exceljs](https://github.com/exceljs/exceljs).

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-export-xlsx exceljs
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginExportXLSX from '@vxe-ui/plugin-export-xlsx'
import ExcelJS from 'exceljs'
// ...

// 1：NPM install, inject ExcelJS objects
VxeUI.use(VxeUIPluginExportXLSX, {
  ExcelJS
})

// 2：CDN install, just make sure window.ExcelJS exists
// VxeUI.use(VxeUIPluginExportXLSX)
```

## Demo

```html
<vxe-button @click="exportEvent">Export.xlsx</vxe-button>

<vxe-table
  ref="tableRef"
  :height="600"
  :data="tableData">
  <vxe-column type="seq" width="60"></vxe-column>
  <vxe-column field="name" title="Name"></vxe-column>
  <vxe-column field="age" title="Age"></vxe-column>
  <vxe-column field="date" title="Date"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test', age: 26, date: '2019-01-01' },
        { id: 101, name: 'test1', age: 30, date: '2019-01-01' },
        { id: 102, name: 'test2', age: 34, date: '2019-01-01' }
      ]
    }
  },
  methods: {
    exportEvent() {
      this.$refs.tableRef.exportData({
        filename: 'export',
        sheetName: 'Sheet1',
        type: 'xlsx'
      })
    }
  }
}
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
