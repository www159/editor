## 解构的 `prosemirror-commands`

如果需要在插件中进行换行或者其他操作，有两种解决方法：

1. 加一层封装传入EditorView。
2. 结构command，放弃dispatch的权利。

两者都行。这里选择借构

#### 可以自己造commands！
