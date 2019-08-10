cc.Class({
    extends: cc.Component,

    properties: {
        txt: cc.Label,
    },

    init(parm) { // 双向绑定中，指定的初始化入口
        this.txt.string = parm.name;
        this.node.on('click', () => {
            // console.log(parm.scene);
            if (parm.scene) cc.director.loadScene(parm.scene);
        })
    },

    // update (dt) {},
});
