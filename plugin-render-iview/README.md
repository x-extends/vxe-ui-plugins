# @vxe-ui/plugin-render-iview

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [iview](https://www.npmjs.com/package/iview), [view-design](https://www.npmjs.com/package/view-design) component.

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-render-iview
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginRenderIView from '@vxe-ui/plugin-render-iview'
import '@vxe-ui/plugin-render-iview/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderIView)
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
      <Input v-model="row.name"></Input>
    </template>
    <template #default="{ row }">
      <span>{{ row.name }}</span>
    </template>
  </vxe-column>
  <vxe-column field="age" title="Age" :edit-render="{}">
    <template #edit="{ row }">
      <Input v-model="row.age"></Input>
    </template>
    <template #default="{ row }">
      <span>{{ row.age }}</span>
    </template>
  </vxe-column>
  <vxe-column field="date" title="Date" width="200" :edit-render="{}">
    <template #edit="{ row }">
      <DatePicker type="date" v-model="row.date"></DatePicker>
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
