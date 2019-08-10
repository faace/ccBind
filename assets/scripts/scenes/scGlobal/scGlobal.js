window.gu = ge.createBind({
    enterTimes: 0,
    clickTimes: 0,
});
gu.click = function () {
    gu.clickTimes++;
}
cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node
    },

    onLoad() {
        gu.enterTimes++;
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });
    },

    // update (dt) {},
});
