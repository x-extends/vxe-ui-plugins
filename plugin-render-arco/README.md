# @vxe-ui/plugin-render-arco

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [@arco-design/web-vue](https://www.npmjs.com/package/@arco-design/web-vue) component.

## Compatibility

It corresponds to [vxe-table v4](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-render-arco
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginRenderArco from '@vxe-ui/plugin-render-arco'
import '@vxe-ui/plugin-render-arco/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderArco)
```

## API

## Table Cell demo

```html
<vxe-table
  height="600"
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-column field="name" title="Name" :edit-render="{}">
    <template #edit="{ row }">
      <a-input v-model="row.name"></a-input>
    </template>
    <template #default="{ row }">
      <span>{{ row.name }}</span>
    </template>
  </vxe-column>
  <vxe-column field="age" title="Age" :edit-render="{}">
    <template #edit="{ row }">
      <a-input v-model="row.age"></a-input>
    </template>
    <template #default="{ row }">
      <span>{{ row.age }}</span>
    </template>
  </vxe-column>
  <vxe-column field="date" title="Date" width="200" :edit-render="{}">
    <template #edit="{ row }">
      <a-date-picker v-model="row.date"></a-date-picker>
    </template>
    <template #default="{ row }">
      <span>{{ row.date }}</span>
    </template>
  </vxe-column>
</vxe-table>
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
