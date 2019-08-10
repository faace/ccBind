cc.Class({
    extends: cc.Component,

    properties: {
        date: cc.Label,
        txt: cc.Label,
        close: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(parm, idx) {
        let date = new Date();
        this.date.string = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        this.txt.string = parm;

        this.node.closeMe = (val) => {
            if (val) val.splice(idx, 1);
        }
    },

    // update (dt) {},
});
