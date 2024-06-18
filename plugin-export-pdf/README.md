# @vxe-ui/plugin-export-pdf

[Vxe UI](https://vxeui.com/) plug-in supports pdf file export. use [jspdf](https://github.com/MrRio/jsPDF).

## Compatibility

It corresponds to [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install vxe-pc-ui @vxe-ui/plugin-export-pdf jspdf
```

```javascript
// ...
import { VxeUI } from 'vxe-pc-ui'
import VxeUIPluginExportPDF from '@vxe-ui/plugin-export-pdf'
import ExcelJS from 'exceljs'
// ...

// 1：NPM install, inject ExcelJS objects
VxeUI.use(VxeUIPluginExportPDF, {
  ExcelJS
})

// 2：CDN install, just make sure window.ExcelJS exists
// VxeUI.use(VxeUIPluginExportPDF)
```

## Demo

```html
<vxe-button @click="exportEvent">Export.pdf</vxe-button>

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
        type: 'pdf'
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
