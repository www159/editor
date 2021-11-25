## emoji

- inputRule
  - 方式: 侵入式菜单
  - 过程:
    1. "::\s"触发。
    2. 弹出widget。
    3. 如果选择表情
      1. 在标签中插入相应的unicode
      2. 增加metaData
    4. 如果点击外面。
      1. 取消表情标签。
    