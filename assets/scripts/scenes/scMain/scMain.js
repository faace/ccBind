require('init'); // 全局初始化

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.btnsList = ge.createBind({
            btns: [
                { name: '输入同步', scene: 'scInput' },
                { name: '显示和隐藏', scene: 'scActive' },
                { name: '点击事件', scene: 'scClick' },
                { name: '图片切换', scene: 'scSprite' },
                { name: '数组列表', scene: 'scList' },
                { name: '分页栏', scene: 'scTab' },
                { name: '全局绑定', scene: 'scGlobal' },
                { name: '动态代码绑定', scene: 'scDync' },
            ]
        })
    },



    // update (dt) {},
});
