# link

### 逻辑
- inputrule: 'Ctrl+Alt+l'
- 创建
  1. 选中选区
  2. 按下快捷键或者menu
  3. 包裹一层link。
  4. 取消选区，光标进入link
      - 根据
  4. 'Enter'键进入对话划框

- 选中
  1. 光标在其中不会弹出对话框
  2. 光标在其中按'enter'进入对话框
  3. link是inline不支持换行
  4. link 重叠
    - 如果选区包含其他link，则立刻取消所有link。
    - 如果选区包含其他link的一部分，视作非法。应该有弹窗报告。
  5. link相邻
    - 判断是否能够join。join到原先的link中

- hover
  - 显示label

- 取消
  1. 选区在link中，再按一次‘Ctrl+Alt+l’取消链接。


## 更新
1. 这次使用一下声明合并了的schema