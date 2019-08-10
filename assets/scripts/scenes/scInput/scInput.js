cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node,
        editBox: cc.EditBox,
    },

    onLoad() {
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });

        this.node.input = ge.createBind({
            txt: ''
        });

        this.node.reverseFunc = function (v) {
            return '反过来（' + v.split('').reverse().join('') + '）';
        };
    },

    // update (dt) {},
});
