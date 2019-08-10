cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node,
        txt: cc.Label,
    },

    onLoad() {
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });

        this.node.tabs = ge.createBind({
            idx: 0,
        });


        this.node.select = (idx) => {
            this.txt.string = '您选择了\n' + ['国王', '皇后', '骑士', '修道士'][idx];
        }
    },

});
