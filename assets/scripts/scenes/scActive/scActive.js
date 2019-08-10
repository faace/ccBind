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
            num: ''
        });

        this.node.isTimesOf3 = function (v) {
            if (parseFloat(v).toString() == "NaN") return false;
            return v % 3 == 0;
        };
    },

    // update (dt) {},
});
