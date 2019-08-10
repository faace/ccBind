# ccBind
#### A two direction binding function for cocos creator.
#### The entry Scene is scMain.

#### 给cocos creator专用的双向绑定功能。
#### 入口场景是scMain。

# description（说明）
#### ccBind is a js script to add two direction binding function to node. It includes the functions below:
1. active control
2. input
3. string format
4. click event
5. sprite switch
6. array prefab
7. tab(toggle)
8. global binding
9. bind by code

#### ccBind是一个用于给cocos creator的节点添加双向绑定的js脚本语言。它包括了以下功能：
1. 显示和隐藏
2. 输入绑定
3. 字符串格式化
4. 点击事件
5. 图片切换
6. 预制体的数组处理
7. 分页栏
8. 全部变量绑定
9. 动态代码绑定

# notice（注意）
#### The values/functions of binding must be defined on the corresponding node(or node's parent, parent's parent or ..) or global environment. They cannot be defined on the component.
#### 双向绑定的变量，格式化公式，响应函数等，必须定义在对应的节点（或者父节点或者父节点的父节点上。。。）或者全部变量上。不能放在组件里面。

# to do（下步要优化的内容）
1. binding in array
2. deleting key detection

#### 带改进的地方
1. 目前数组下是没有双向绑定的功能，
2. 当前绑定对象，删除时，没有清空回调行数

# example（例子）
#### [pls click here](https://faace.github.io/ccBind/example/index.html)
#### [请点这里](https://faace.github.io/ccBind/example/index.html)

#### 这个双向绑定是第一版，目前在没经过大量压力使用的情况下，运行还算良好。尤其在解决数据更新时，同步到各个对应显示和控制的节点上，不需要大量的代码监听来控制。
#### 当然，双向绑定也有一些缺点，主要在维护上会不太方便，不容易查看到到关联关系。这个问题计划在后期增加一些追踪的工具。
#### 欢迎大家指教和共同参与完善。
#### qq讨论群: 325965847


