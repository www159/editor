# layer
类似于layui的layer(电)。
#### 弹出层
设定一些参数。定位全局弹出。
用途: 警告，通知。需要人性化一些。
分类：
- layer 只显示。一定时间消失。
- confirm 需要确认。回调形式。
特性：
1. 为了不受制于pm的离散化时间划分。使用emitter
2. 因为完全脱离在pm之外，为了防止垃圾回收，需要在editor上挂载。

顺序：
- layer
    1. 发现问题。
    2. emit。
    3. on 立刻弹出。
    4. 片刻后消失。

例子： 
```ts
callLayer({
    type: 'layer',
    content,
    icon,
    delay,
})
```
- confirm
    1. 增设按钮。按钮只有两个槽。
例子:
```ts
callLayer({
    type: 'confirm',
    content,
    icon,
    button: [
        () => {},
        () => {}, 
    ]//这是一个二元组/_\
})
```

#### 辅助层
鉴于大量的扩展需要人性化的弹出层。并且往往都是跟随效果。比如emoji，link。
完全可以定义一个通用的跟随弹出层。再通过函数挂载相应的的内容界面。

### 除此之外
1. pm天生不支持纯事件驱动型插件。因此需要加入额外的扩展.
2. 还有就是后续海量的事件如何维护类型系统。。。
3. 每一个editor插件都要有自己的内存空间。tiptap的做法是使用storage来初始化状态。并且使用onUpdate来更新storage。因为该状态不会涉及

#### 需要做的
1. 维护eventmitter类型系统
2. 增加emitter插件
3. 增加注入