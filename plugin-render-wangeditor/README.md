# @vxe-ui/plugin-render-wangeditor

[Vxe UI](https://vxeui.com/) plug-in for compatibility with the [wangeditor](https://www.npmjs.com/package/@wangeditor/editor) component.

## Compatibility

It corresponds to [vxe-table v4](https://www.npmjs.com/package/vxe-table) or [vxe-pc-ui v4](https://www.npmjs.com/package/vxe-pc-ui)  

## Installing

```shell
npm install @vxe-ui/plugin-render-wangeditor
```

```javascript
// ...
// Use vxe-pc-ui
import { VxeUI } from 'vxe-pc-ui'
// Use vxe-table
// import { VxeUI } from 'vxe-table'
import VxeUIPluginRenderWangEditor, { WangEditor } from '@vxe-ui/plugin-render-wangeditor'
import '@vxe-ui/plugin-render-wangeditor/dist/style.css'
import * as wangEditor from '@wangeditor/editor'
// ...

// 方式1：NPM 安装，注入 wangEditor 对象
VXETable.use(VxeUIPluginRenderWangEditor, {
  wangEditor,
  // 自定义上传图片方法
  uploadImageMethod ({ file }) {
    return { url: '' }
  },
  // 自定义上传视频方法
  uploadVideoMethod ({ file }) {
    return { url: '' }
  }
})

// // 方式2：CDN 安装，只要确保 window.wangEditor 存在即可
// VXETable.use(VxeUIPluginRenderWangEditor, {
//   // 自定义上传图片方法
//   uploadImageMethod ({ file }) {
//     return { url: '' }
//   },
//   // 自定义上传视频方法
//   uploadVideoMethod ({ file }) {
//     return { url: '' }
//   }
// })

// 可选组件
app.use(WangEditor)
```

## Form Demo

```html
<template>
  <vxe-form
    title-width="120"
    :data="formData">
    <vxe-form-item title="名称" field="name" span="24" :item-render="{ name: 'VxeInput' }"></vxe-form-item>
    <vxe-form-item title="富文本" field="describe" span="24" :item-render="{ name: 'WangEditor' }"></vxe-form-item>
  </vxe-form>
</template>

<script>
export default {
  data () {
    const formData = {
      name: 'test1',
      describe: ''
    }

    return {
      formData
    }
  }
}
</script>
```

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-ui-plugins](https://contrib.rocks/image?repo=x-extends/vxe-ui-plugins)](https://github.com/x-extends/vxe-ui-plugins/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
