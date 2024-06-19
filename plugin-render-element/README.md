# @vxe-ui/plugin-render-element

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [element-plus](https://www.npmjs.com/package/element-plus) component.

## Compatibility

It corresponds to [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install vxe-pc-ui @vxe-ui/plugin-render-element
```

```javascript
// ...
import { VxeUI } from 'vxe-pc-ui'
import VxeUIPluginRenderElement from '@vxe-ui/plugin-render-element'
import '@vxe-ui/plugin-render-element/dist/style.css'
// ...

VxeUI.use(VxeUIPluginRenderElement)
```

## Cell demo

```html
<vxe-table
  height="600"
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-column field="name" title="Name" :edit-render="{name: 'ElInput'}"></vxe-column>
  <vxe-column field="age" title="Age" :edit-render="{name: 'ElInputNumber'}"></vxe-column>
  <vxe-column field="date" title="Date" width="200" :edit-render="{name: 'ElDatePicker'}"></vxe-column>
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

## Filter demo

```html
<vxe-table
  height="600"
  :data="tableData">
  <vxe-column field="name" title="Name":filters="nameOptions" :filter-render="{name: 'ElInput'}"></vxe-column>
  <vxe-column field="age" title="Age"></vxe-column>
  <vxe-column field="date" title="Date" ></vxe-column>
</vxe-table>
```

```javascript
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
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
})
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
