# @vxe-ui/plugin-validator

[Vxe UI](https://vxeui.com/) plug-in supports common validator configurations.

## Compatibility

It corresponds to [vxe-table v3](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v3](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-validator
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginValidator from '@vxe-ui/plugin-validator'
// ...

VxeUI.use(VxeUIPluginValidator)
```

## API

Support for table and form.

### Validator codes

| code 编码 | describe 描述 | params 参数 |
|------|------|------|
| MOBILE_NUMBER | 手机号13位 | — |
| EMAIL_ADDRESS  | 邮箱地址 | — |
| IDENTITY_CARD  | 身份证号码 | — |
| IP_ADDRESS  | IP地址 | — |
| URL  | URL地址 | — |
| PLATE_NUMBER  | 车牌号 | — |

## Demo

```html
<vxe-table
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}"
  :edit-rules="editRules">
  <vxe-column type="seq" width="60"></vxe-column>
  <vxe-column field="name" title="Name" :edit-render="{name: 'input'}"></vxe-column>
  <vxe-column field="mobile" title="Mobile" :edit-render="{name: 'input'}"></vxe-column>
  <vxe-column field="email" title="Email" :edit-render="{name: 'input'}"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100,  name: 'test1', mobile: '', email: '' },
        { id: 101,  name: 'test2', mobile: '', email: '' },
        { id: 102,  name: 'test3', mobile: '', email: '' }
      ],
      editRules: {
        mobile: [
          { required: true, validator: 'MOBILE_NUMBER' }
        ],
        email: [
          { required: true, validator: 'EMAIL_ADDRESS' }
        ]
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
