var WrapMode = cc.Enum({
    Active: 0, // 控制active属性
    Label: 1, // 控制字符串
    EditBox: 2, // 控制字符串
    Prefab: 3, // 预制体
    CCNode: 4, // 指定节点
    SpriteFrame: 5, // 控制图片切换
    Toggle: 7, // 控制一组节点的互相切换
    Click: 8, // 点击事件
});

var CCBindOneToggle = cc.Class({
    name: "CCBindOneToggle",
    properties: {
        default: cc.Node, // 背景
        check: cc.Node, // 选中
        val: '', // 这个只等于双向绑定的val时，就是选中
    }
});
var addClick = function (target, cb, isScale) { // 加上点击监听事件
    if (!target.getComponent(cc.Button)) {
        let btn = target.addComponent(cc.Button);
        if (isScale) {
            btn.transition = cc.Button.Transition.SCALE;
            btn.duration = 0.1;
            btn.zoomScale = 1.05;
        }
    }
    target.off('click');
    target.on('click', cb);
    return target;
};

cc.Class({
    extends: cc.Component,

    properties: {
        type: {
            default: function () {
                return WrapMode.Active;
            },
            type: WrapMode
        },
        val: {
            default: '',
            tooltip: '需要绑定的变量，支持多层带点结构，从当前节点一直向上找'
        },
        formator: {
            visible: function () {
                return this.type == WrapMode.Label || this.type == WrapMode.Active || this.type == WrapMode.Sprite;
            },
            default: '',
            tooltip: '对val重新格式化公式（选填）'
        },
        prefab: {
            visible: function () {
                return this.type == WrapMode.Prefab;
            },
            default: undefined,
            type: cc.Prefab,
            tooltip: '最好配合Layout一起使用'
        },
        ccNode: {
            visible: function () {
                return this.type == WrapMode.CCNode;
            },
            default: undefined,
            type: cc.Node,
            displayName: 'Node',
            tooltip: '最好配合Layout一起使用'
        },
        spriteFrame: {
            visible: function () {
                return this.type == WrapMode.SpriteFrame;
            },
            default: [],
            type: [cc.SpriteFrame],
            tooltip: '根据参数切换SpriteFrame'
        },
        clickCb: {
            visible: function () {
                return this.type == WrapMode.Click;
            },
            default: '',
            tooltip: '点击节点的回调函数'
        },
        toggle: {
            visible: function () {
                return this.type == WrapMode.Toggle;
            },
            default: [],
            type: [CCBindOneToggle],
            tooltip: '控制多个节点之间的切换'
        },
        toggleCb: {
            visible: function () {
                return this.type == WrapMode.Toggle;
            },
            default: '',
            tooltip: '每次切换toggle的回调函数'
        },
        tag: {
            visible: function () {
                return this.type == WrapMode.Click;
            },
            default: '',
            tooltip: '标签，用于识别不同的节点'
        }
    },

    getBaseObj: function (val) { //从下往父节点找，如果找不到再找全局的
        if (!val) return;
        let v0 = val.split('.')[0];
        let parent = this.node;
        while (parent) {
            if (parent[v0]) return parent[v0];
            parent = parent.parent;
        }
        if (window[v0]) return window[v0];
    },
    getVal: function (val) {
        if (!val) return;
        let v = val.split('.');
        v.shift();
        let obj = this.baseObj;
        while (v.length) {
            obj = obj[v.shift()];
            if (typeof obj == 'undefined') return;
        }
        return obj;
    },
    getFunc: function (func) { //从下往父节点找，如果找不到再找全局的
        if (!func) return func;
        let f = func.split('.');
        let f0 = f.shift();
        let parent = this.node;
        let baseFunc;
        while (parent) {
            if (parent[f0]) {
                baseFunc = parent[f0];
                break;
            }
            parent = parent.parent;
        }
        if (!baseFunc && window[f0]) baseFunc = window[f0];

        if (baseFunc) {
            while (baseFunc && f.length) {
                baseFunc = baseFunc[f.shift()];
            }
        }

        return baseFunc ? baseFunc : func.replace(/\'/g, '"');;
    },

    onLoad: function () {
        this.baseObj = this.getBaseObj(this.val);
        if (!this.baseObj) return;

        if (this.type == WrapMode.Active) {
            this.func = this.activeFunc;
        } else if (this.type == WrapMode.Label) {
            this.func = this.labelFunc;
        } else if (this.type == WrapMode.EditBox) {
            this.func = this.editBoxFunc;
            this.node.on('text-changed', (a) => {
                let vv = this.baseObj;
                let theV = this.val.split('.');
                if (theV[0] == 'this') theV.shift(); // 先去掉this这一层
                theV.shift();
                while (theV.length > 1) vv = vv[theV.shift()];
                vv[theV[0]] = this.node.getComponent(cc.EditBox).string;
            });
        } else if (this.type == WrapMode.CCNode) {
            this.func = this.nodeFunc;

            this.np = this.createNodePool(this.ccNode, this.node);
        } else if (this.type == WrapMode.Prefab) {
            this.func = this.nodeFunc;

            this.np = this.createNodePool(this.prefab, this.node);
        } else if (this.type == WrapMode.SpriteFrame) {
            this.func = this.spriteFunc;
        } else if (this.type == WrapMode.Toggle) {
            if (this.toggle.length > 0) this.func = this.toggleFunc;
            let vv = this.baseObj;
            let theV = this.val.split('.');
            if (theV[0] == 'this') theV.shift(); // 先去掉this这一层
            theV.shift();
            while (theV.length > 1) vv = vv[theV.shift()];
            theV = theV[0]; // 减少一层引用
            this.toggle.forEach(function (one) {
                addClick(one.default, function () {
                    if (vv[theV] != one.val) vv[theV] = one.val;
                }, true);
            });

            if (this.toggleCb) {
                this.toggleCb = this.getFunc(this.toggleCb);
            }

        } else if (this.type == WrapMode.Click) {
            if (this.clickCb) {
                addClick(this.node, () => {
                    let val = this.getVal(this.val)
                    let clickCb = this.getFunc(this.clickCb);
                    (typeof val != 'undefined') && (typeof clickCb == 'function') && clickCb(val, this.tag);
                }, true);
            }
        }

        if (this.func) { // 有处理函数才会真正去绑定
            if (this.formator) {
                this.formator = this.getFunc(this.formator);
            }

            let theV = this.val.split('.');
            theV.shift();
            this.func = this.func.bind(this);
            this.baseObj.map(theV.join('.'), this.func);
        }
    },
    activeFunc: function (v) {
        if (this.formator) {
            if (typeof this.formator == 'function') v = this.formator(v);
            else { // 如果是普通字符串，就应该要输入一个对象
                try {
                    let formator = JSON.parse(this.formator);
                    let rc = true;
                    if (parseFloat(v).toString() != "NaN") {
                        for (var i in formator) {
                            switch (i) {
                                case '$gt':
                                    rc = rc && (v > formator[i]);
                                    break;
                                case '$gte':
                                    rc = rc && (v >= formator[i]);
                                    break;
                                case '$lt':
                                    rc = rc && (v < formator[i]);
                                    break;
                                case '$lte':
                                    rc = rc && (v <= formator[i]);
                                    break;
                                case '$eq':
                                    rc = rc && (v == formator[i]);
                                    break;
                                case '$in':
                                    rc = rc && (formator.indexOf(v) > -1);
                                    break;
                                default: // 其他的不支持
                                    rc = false;
                                    break;
                            }
                        }
                        v = rc;
                    } else v = false;
                } catch (error) {
                    console.log(error);
                }
            }
        }
        this.node.active = v;
    },
    labelFunc: function (v) {
        let label = this.label;
        if (!this.label) label = this.label = this.node.getComponent(cc.Label);
        if (label) {
            let val = v;
            if (this.formator) { // 可以留着 以后扩展
                if (typeof this.formator == 'string') {
                    if (this.formator.format) val = this.formator.format(val);
                    else val = this.formator.replace('%s', val);
                }
                else val = this.formator(val);
            }
            label.string = val;
        }
    },
    editBoxFunc: function (v) {
        let editBox = this.node.getComponent(cc.EditBox);
        if (editBox) {
            if (editBox.string != v) {
                editBox.string = v;
                this.node.dispatchEvent(new cc.Event.EventCustom('text-changed', true));
            }
        }
    },
    nodeFunc: function (v) {
        for (let i = this.node.getChildrenCount() - 1; i >= 0; i--) {
            this.np.put(this.node._children[i]);
        }
        if (v) {
            if (typeof v.length != 'undefined') {
                for (let i = 0; i < v.length; i++) {
                    this.np.get(null, v[i], i)
                }
            } else {
                for (var i in v) {
                    this.np.get(null, v[i], i)
                }
            }
        }
    },
    spriteFunc: function (v) {
        let sprite = this.sprite;
        if (!this.sprite) sprite = this.sprite = this.node.getComponent(cc.Sprite);
        if (sprite) {
            if (this.formator) {
                if (typeof this.formator == 'function') v = this.formator(v);
                else { // 只针对true和false
                    try {
                        let formator = JSON.parse(this.formator);
                        if (formator.yes && formator.no) { // 切换
                            let rc = true;
                            let yes, no;
                            v = v - 0;
                            if (parseFloat(v).toString() != "NaN") {
                                for (var i in formator) {
                                    switch (i) {
                                        case '$gt':
                                            rc = (v > formator[i].num);
                                            break;
                                        case '$gte':
                                            rc = rc && (v >= formator[i]);
                                            break;
                                        case '$lt':
                                            rc = rc && (v < formator[i]);
                                            break;
                                        case '$lte':
                                            rc = rc && (v <= formator[i]);
                                            break;
                                        case '$eq':
                                            rc = rc && (v == formator[i]);
                                            break;
                                        case '$in':
                                            rc = rc && (formator.indexOf(v) > -1);
                                            break;
                                        case 'yes':
                                            yes = formator[i];
                                            break;
                                        case 'no':
                                            no = formator[i];
                                            break;
                                        default: // 其他的不处理
                                            break;
                                    }
                                }
                            } else rc = false;
                            v = rc ? yes : no;
                        }

                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            sprite.spriteFrame = this.spriteFrame[v] || null;
        }
    },
    toggleFunc: function (v) {
        this.toggle.forEach((one) => {
            if (one.val == v) {
                one.default.active = false;
                one.check.active = true;
            } else {
                one.default.active = true;
                one.check.active = false;
            }
        });
        this.toggleCb && this.toggleCb(v);
    },
    onDestroy() {
        let theV = this.val.split('.');
        if (theV[0] == 'this') theV.shift(); // 先去掉this这一层
        theV.shift();
        this.baseObj.unmap(theV.join('.'), this.func);
        this.baseObj = null;

        if (this.nodePoolList) {
            while (this.nodePoolList.length > 0) {
                this.nodePoolList[0].clear();
                this.nodePoolList.splice(0, 1);
            }
        }
    },

    getJs: function (node, pre) {
        var comp = node._components || [];
        for (var i = 0; i < comp.length; i++) {
            var name = comp[i].name.split('<');
            if (name.length == 2) {
                if (name[1].indexOf(pre || 'pf') == 0) {
                    return comp[i];
                } else if (name[1].indexOf('ly') == 0) {
                    return comp[i];
                } else if (name[1].indexOf(name[0]) == 0) {
                    return comp[i];
                }
            }
        }
        return null;
    },
    createNodePool: function (prefab, target) { // 需要生成的预制体， 预计需要放到那个节点
        this.nodePoolList = this.nodePoolList || [];
        let np = new cc.NodePool();
        let getJs = this.getJs;
        this.nodePoolList.push(np);
        return {
            get: function (tt, parm, idx) {
                if (np.size() == 0) np.put(cc.instantiate(prefab));
                let one = np.get();
                let oneJs = getJs(one);
                one.parent = tt || target;
                if (oneJs && oneJs.init && parm) oneJs.init(parm, idx);
                return one;
            },
            put: function (item) { // 单独放一个元素回来
                np.put(item);
            },
            clear: function (tt) { // tt可选，如果没填，就用创建时的节点
                let children = (tt || target).children;
                for (let i = children.length - 1; i >= 0; i--) np.put(children[i]);
            },
            size: function () {
                return np.size();
            },
            add: function () {
                np.put(cc.instantiate(prefab));
            },
        }

    },
});
