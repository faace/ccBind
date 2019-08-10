cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node,
        txtCounter: cc.Label,
        btn: cc.Node,
        btnTxt: cc.Label,
    },

    onLoad() {
        this.btnBack.on('click', () => {
            cc.director.loadScene('scMain');
        });

        this.counter = ge.createBind({
            dt: 0,
            ms: 100,
            control: {
                times: 0,
            }
        });

        this.bindData();
        this.btn.on('click', () => {
            if (this.btnTxt.string == '解绑') this.unbindData();
            else this.bindData();
        });
    },
    bindData() {
        if (!this.func) {
            this.func = () => {
                this.txtCounter.string = this.counter.control.times;
            }
        }
        this.btnTxt.string = '解绑';
        this.counter.map('control.times', this.func); // 绑定的时候，不需要带上counter，多层用.链接起来
    },
    unbindData() {
        if (!this.func) return;
        this.btnTxt.string = '绑定';
        this.counter.unmap('control.times', this.func);
    },
    update(dt) {
        let counter = this.counter;
        counter.dt += dt * 1000;
        if (counter.dt >= counter.ms) {
            counter.dt -= counter.ms;
            counter.control.times++;
        }
    },
});
