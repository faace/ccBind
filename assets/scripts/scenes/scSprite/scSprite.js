cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node
    },

    onLoad() {
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });

        this.node.deer = ge.createBind({
            ms: 100,
            num: 4,
            idx: 0
        });
        this.dt = 0;
    },

    update(dt) {
        this.dt += dt * 1000;
        let deer = this.node.deer;
        if (this.dt >= deer.ms) {
            this.dt -= deer.ms;
            deer.idx = (deer.idx + 1) % deer.num;
        }
    },
});
