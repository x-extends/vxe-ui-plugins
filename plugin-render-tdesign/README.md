# @vxe-ui/plugin-render-tdesign

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [tdesign-vue](https://www.npmjs.com/package/tdesign-vue) component.

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

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

## API

## Cell demo

```html
<vxe-table
  height="600"
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-column field="name" title="Name" :edit-render="{}">
    <template #edit="{ row }">
      <t-input v-model="row.name"></t-input>
    </template>
    <template #default="{ row }">
      <span>{{ row.name }}</span>
    </template>
  </vxe-column>
  <vxe-column field="age" title="Age" :edit-render="{}">
    <template #edit="{ row }">
      <t-input v-model="row.age"></t-input>
    </template>
    <template #default="{ row }">
      <span>{{ row.age }}</span>
    </template>
  </vxe-column>
  <vxe-column field="date" title="Date" width="200" :edit-render="{}">
    <template #edit="{ row }">
      <t-date-picker v-model="row.date"></t-date-picker>
    </template>
    <template #default="{ row }">
      <span>{{ row.date }}</span>
    </template>
  </vxe-column>
</vxe-table>
```

```javascript
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
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
