// 这个init的文件会在scmain里面最先加载，把bind设置成一个全局函数

window.bind = require('bind');

window.ge = { // 设定一个全局变量
    createBind: function (obj) { // 创建一个双向绑定
        return bind(obj);
    }
};