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

        let todos = ge.createBind({
            next: '', // 绑定editBox
            list: [
                '明天记得睡懒觉',

            ]
        });

        this.editBox.node.on('editing-return', () => {
            todos.list.push(todos.next);
            todos.next = '';
        });

        this.node.todos = todos;
    },

    // update (dt) {},
});
