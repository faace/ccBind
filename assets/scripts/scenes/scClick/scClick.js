cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node
    },

    onLoad() {
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });

        let action = ge.createBind({
            color: ''
        });
        this.node.action = action;
        this.node.click = function (v, tag) {
            action.color = tag;
        };

        this.node.txtFormat = function (v) {
            if (v) return '你点了' + v;
            else return '请选择你喜欢的颜色';
        };
    },

    // update (dt) {},
});
