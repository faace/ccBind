window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  bind: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6b4ectwDslJbaPxHJr+hVzb", "bind");
    "use strict";
    var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    module.exports = function(obj2, mapping) {
      var debug = false;
      var array = [];
      var isArray = Array.isArray;
      var isObject = function isObject(o) {
        return "object" == ("undefined" === typeof o ? "undefined" : _typeof(o));
      };
      function forEach(subject, fn) {
        var length = subject.length;
        for (var i = 0; i < length; i++) fn(subject[i], i, subject);
      }
      function __export(target, object) {
        if (!(object instanceof Object)) return object;
        forEach(Object.getOwnPropertyNames(object), function(key) {
          var value = object[key];
          if (Bind.prototype[key] || "__callback" === key) return;
          isObject(value) && null !== value && value instanceof Array ? target[key] = [].map.call(value, function(value) {
            return value instanceof Object ? __export(target[key] || {}, value) : value;
          }) : isObject(value) && null !== value && !isArray(value) && "[Object object]" === value.toString() ? target[key] = __export(target[key] || {}, value) : target[key] = value;
        });
        return target;
      }
      function AugmentedArray(callback, settings) {
        var methods = "pop push reverse shift sort splice unshift".split(" ");
        forEach(methods, function eachArrayMethod(method) {
          this[method] = function augmentedMethod() {
            this.__dirty = true;
            var ret = __export({}, array[method].apply(this, arguments));
            delete this.__dirty;
            callback && settings.ready && callback(this);
            return ret;
          }.bind(this);
        }.bind(this));
        var length = this.length;
        Object.defineProperty(this, "length", {
          configurable: false,
          enumerable: true,
          set: function set(v) {
            if (this.__dirty) {
              length = v;
              return;
            }
            var newLength = 1 * v;
            if (length !== newLength) {
              newLength > length ? this.push.apply(this, new Array(newLength - length)) : this.splice(newLength);
              length = newLength;
            }
            return v;
          },
          get: function get() {
            return length;
          }
        });
        return this;
      }
      AugmentedArray.prototype = [];
      function extend(target, object, settings, _path) {
        _path || (_path = []);
        if (settings.ready && object.__callback) return target;
        if (object instanceof Bind) return object;
        var $;
        forEach(Object.getOwnPropertyNames(object), function eachProp(key) {
          if ("__callback" === key) return;
          var value = object[key];
          var path = [].slice.call(_path);
          var callback;
          path.push(key);
          var selector = settings.mapping[path.join(".")];
          debug && console.log("key: %s / %s", key, path.join("."), selector);
          selector && "[object Object]" === selector.toString() ? selector.callback && (callback = selector.callback) : "function" === typeof selector && (callback = selector);
          callback && path.reduce(function(prev, curr, i, all) {
            prev[curr] || (prev[curr] = {
              __callback: []
            });
            i === all.length - 1 && prev[curr].__callback.push(callback);
            return prev[curr];
          }, settings.callbacks);
          var findCallback = function findCallback(value) {
            var callbacks = [];
            var values = [];
            var instance = settings.instance;
            var dirty = false;
            var always = false;
            debug && console.log("> finding callback for %s", key, path);
            path.reduce(function(prev, curr, i) {
              if (prev && prev[curr] && curr) {
                instance = instance[curr];
                if (null === instance || void 0 === instance) return prev[curr] || {};
                if (prev[curr].__callback) {
                  var v = i === path.length - 1 ? value : instance;
                  instance.__dirty && (dirty = true);
                  i === path.length - 1 && (always = {
                    path: path.join("."),
                    callback: prev[curr].__callback,
                    instance: __export(v instanceof Array ? [] : {}, v)
                  });
                  if (!dirty) {
                    values.push(__export(v instanceof Array ? [] : {}, v));
                    callbacks.push(prev[curr].__callback);
                  }
                }
                return prev[curr] || {};
              }
            }, settings.callbacks);
            if (!dirty) {
              values.reverse();
              callbacks.reverse().forEach(function(fns, i) {
                var v = values[i];
                var stop = false;
                fns.forEach(function(fn, i) {
                  stop || (stop = fn.call(settings.instance, v));
                });
              });
            }
            dirty && always && always.callback.forEach(function(fn) {
              fn.call(settings.instance, always.instance);
            });
          };
          var definition = {
            configurable: true,
            enumerable: true,
            set: function set(v) {
              var old = value !== v ? value : void 0;
              value = settings.ready && isObject(v) && null !== v && !isArray(v) && !v.__callback ? extend(target[key] ? __export({}, target[key]) : {}, v, settings, path) : isArray(v) ? extend(new AugmentedArray(findCallback, settings), v, settings, path) : v;
              debug && console.log("set: key(%s): %s -> %s", key, JSON.stringify(old), JSON.stringify(v));
              settings.ready ? findCallback(value) : "undefined" !== typeof settings.mapping[path.join(".")] && settings.deferred.push(findCallback.bind(target, value, old));
            },
            get: function get() {
              return value;
            }
          };
          try {
            Object.defineProperty(target, key, definition);
          } catch (e) {
            debug && console.log("failed on Object.defineProperty", e.toString(), e.stack);
          }
          isObject(value) && null !== value && !isArray(value) ? target[key] = extend(target[key] || {}, value, settings, path) : isArray(value) ? target[key] = extend(new AugmentedArray(findCallback, settings), value, settings, path) : target instanceof AugmentedArray || (target[key] = value);
        });
        target instanceof AugmentedArray && target.push.apply(target, object);
        return target;
      }
      var settings = {
        mapping: mapping || {},
        callbacks: {},
        deferred: [],
        ready: false
      };
      function Bind(obj) {
        settings.instance = this;
        extend(this, obj, settings);
        settings.ready = true;
        settings.deferred.length && forEach(settings.deferred, function deferreds(fn) {
          fn();
        });
        return this;
      }
      Bind.prototype.__export = function() {
        return __export({}, this);
      };
      Bind.prototype.map = function(path, selector) {
        var callback;
        path = path.split(".");
        selector && "[object Object]" === selector.toString() ? selector.callback && (callback = selector.callback) : "function" === typeof selector && (callback = selector);
        if (callback) {
          var that = this;
          path.reduce(function(prev, curr, i, all) {
            that = that[curr];
            prev[curr] || (prev[curr] = {
              __callback: []
            });
            if (i === all.length - 1) {
              prev[curr].__callback.push(callback);
              callback(that);
            }
            return prev[curr];
          }, settings.callbacks);
        }
      };
      Bind.prototype.unmap = function(path, selector) {
        var callback;
        path = path.split(".");
        selector && "[object Object]" === selector.toString() ? selector.callback && (callback = selector.callback) : "function" === typeof selector && (callback = selector);
        callback && path.reduce(function(prev, curr, i, all) {
          prev[curr] || (prev[curr] = {
            __callback: []
          });
          if (i === all.length - 1) {
            var __callback = prev[curr].__callback;
            for (var _i = 0; _i < __callback.length; _i++) if (__callback[_i]._uid == callback._uid) {
              __callback.splice(_i, 1);
              break;
            }
          }
          return prev[curr];
        }, settings.callbacks);
      };
      Bind.prototype.getVal = function(path) {
        path = path.split(".");
        var val;
        if (path.length > 0) {
          val = this[path[0]];
          for (var i = 1; i < path.length; i++) {
            if (!val) break;
            val = val[path[i]];
          }
        }
        return val;
      };
      Bind.prototype.forEach = function(cb) {
        if (!cb) return;
        for (var i in this) if (this.hasOwnProperty(i) && cb(i, this[i])) break;
      };
      Bind.prototype.isBind = function() {
        return this instanceof Bind;
      };
      return new Bind(obj2);
    };
    cc._RF.pop();
  }, {} ],
  ccBind: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "159cd/BYKxFcricpYxhpsCX", "ccBind");
    "use strict";
    var WrapMode = cc.Enum({
      Active: 0,
      Label: 1,
      EditBox: 2,
      Prefab: 3,
      CCNode: 4,
      SpriteFrame: 5,
      Toggle: 7,
      Click: 8
    });
    var CCBindOneToggle = cc.Class({
      name: "CCBindOneToggle",
      properties: {
        default: cc.Node,
        check: cc.Node,
        val: ""
      }
    });
    var addClick = function addClick(target, cb, isScale) {
      if (!target.getComponent(cc.Button)) {
        var btn = target.addComponent(cc.Button);
        if (isScale) {
          btn.transition = cc.Button.Transition.SCALE;
          btn.duration = .1;
          btn.zoomScale = 1.05;
        }
      }
      target.off("click");
      target.on("click", cb);
      return target;
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        type: {
          default: function _default() {
            return WrapMode.Active;
          },
          type: WrapMode
        },
        val: {
          default: "",
          tooltip: "\u9700\u8981\u7ed1\u5b9a\u7684\u53d8\u91cf\uff0c\u652f\u6301\u591a\u5c42\u5e26\u70b9\u7ed3\u6784\uff0c\u4ece\u5f53\u524d\u8282\u70b9\u4e00\u76f4\u5411\u4e0a\u627e"
        },
        formator: {
          visible: function visible() {
            return this.type == WrapMode.Label || this.type == WrapMode.Active || this.type == WrapMode.Sprite;
          },
          default: "",
          tooltip: "\u5bf9val\u91cd\u65b0\u683c\u5f0f\u5316\u516c\u5f0f\uff08\u9009\u586b\uff09"
        },
        prefab: {
          visible: function visible() {
            return this.type == WrapMode.Prefab;
          },
          default: void 0,
          type: cc.Prefab,
          tooltip: "\u6700\u597d\u914d\u5408Layout\u4e00\u8d77\u4f7f\u7528"
        },
        ccNode: {
          visible: function visible() {
            return this.type == WrapMode.CCNode;
          },
          default: void 0,
          type: cc.Node,
          displayName: "Node",
          tooltip: "\u6700\u597d\u914d\u5408Layout\u4e00\u8d77\u4f7f\u7528"
        },
        spriteFrame: {
          visible: function visible() {
            return this.type == WrapMode.SpriteFrame;
          },
          default: [],
          type: [ cc.SpriteFrame ],
          tooltip: "\u6839\u636e\u53c2\u6570\u5207\u6362SpriteFrame"
        },
        clickCb: {
          visible: function visible() {
            return this.type == WrapMode.Click;
          },
          default: "",
          tooltip: "\u70b9\u51fb\u8282\u70b9\u7684\u56de\u8c03\u51fd\u6570"
        },
        toggle: {
          visible: function visible() {
            return this.type == WrapMode.Toggle;
          },
          default: [],
          type: [ CCBindOneToggle ],
          tooltip: "\u63a7\u5236\u591a\u4e2a\u8282\u70b9\u4e4b\u95f4\u7684\u5207\u6362"
        },
        toggleCb: {
          visible: function visible() {
            return this.type == WrapMode.Toggle;
          },
          default: "",
          tooltip: "\u6bcf\u6b21\u5207\u6362toggle\u7684\u56de\u8c03\u51fd\u6570"
        },
        tag: {
          visible: function visible() {
            return this.type == WrapMode.Click;
          },
          default: "",
          tooltip: "\u6807\u7b7e\uff0c\u7528\u4e8e\u8bc6\u522b\u4e0d\u540c\u7684\u8282\u70b9"
        }
      },
      getBaseObj: function getBaseObj(val) {
        if (!val) return;
        var v0 = val.split(".")[0];
        var parent = this.node;
        while (parent) {
          if (parent[v0]) return parent[v0];
          parent = parent.parent;
        }
        if (window[v0]) return window[v0];
      },
      getVal: function getVal(val) {
        if (!val) return;
        var v = val.split(".");
        v.shift();
        var obj = this.baseObj;
        while (v.length) {
          obj = obj[v.shift()];
          if ("undefined" == typeof obj) return;
        }
        return obj;
      },
      getFunc: function getFunc(func) {
        if (!func) return func;
        var f = func.split(".");
        var f0 = f.shift();
        var parent = this.node;
        var baseFunc = void 0;
        while (parent) {
          if (parent[f0]) {
            baseFunc = parent[f0];
            break;
          }
          parent = parent.parent;
        }
        !baseFunc && window[f0] && (baseFunc = window[f0]);
        if (baseFunc) while (baseFunc && f.length) baseFunc = baseFunc[f.shift()];
        return baseFunc || func.replace(/\'/g, '"');
      },
      onLoad: function onLoad() {
        var _this = this;
        this.baseObj = this.getBaseObj(this.val);
        if (!this.baseObj) return;
        if (this.type == WrapMode.Active) this.func = this.activeFunc; else if (this.type == WrapMode.Label) this.func = this.labelFunc; else if (this.type == WrapMode.EditBox) {
          this.func = this.editBoxFunc;
          this.node.on("text-changed", function(a) {
            var vv = _this.baseObj;
            var theV = _this.val.split(".");
            "this" == theV[0] && theV.shift();
            theV.shift();
            while (theV.length > 1) vv = vv[theV.shift()];
            vv[theV[0]] = _this.node.getComponent(cc.EditBox).string;
          });
        } else if (this.type == WrapMode.CCNode) {
          this.func = this.nodeFunc;
          this.np = this.createNodePool(this.ccNode, this.node);
        } else if (this.type == WrapMode.Prefab) {
          this.func = this.nodeFunc;
          this.np = this.createNodePool(this.prefab, this.node);
        } else if (this.type == WrapMode.SpriteFrame) this.func = this.spriteFunc; else if (this.type == WrapMode.Toggle) {
          this.toggle.length > 0 && (this.func = this.toggleFunc);
          var vv = this.baseObj;
          var theV = this.val.split(".");
          "this" == theV[0] && theV.shift();
          theV.shift();
          while (theV.length > 1) vv = vv[theV.shift()];
          theV = theV[0];
          this.toggle.forEach(function(one) {
            addClick(one.default, function() {
              vv[theV] != one.val && (vv[theV] = one.val);
            }, true);
          });
          this.toggleCb && (this.toggleCb = this.getFunc(this.toggleCb));
        } else this.type == WrapMode.Click && this.clickCb && addClick(this.node, function() {
          var val = _this.getVal(_this.val);
          var clickCb = _this.getFunc(_this.clickCb);
          "undefined" != typeof val && "function" == typeof clickCb && clickCb(val, _this.tag);
        }, true);
        if (this.func) {
          this.formator && (this.formator = this.getFunc(this.formator));
          var _theV = this.val.split(".");
          _theV.shift();
          this.func = this.func.bind(this);
          this.baseObj.map(_theV.join("."), this.func);
        }
      },
      activeFunc: function activeFunc(v) {
        if (this.formator) if ("function" == typeof this.formator) v = this.formator(v); else try {
          var formator = JSON.parse(this.formator);
          var rc = true;
          if ("NaN" != parseFloat(v).toString()) {
            for (var i in formator) switch (i) {
             case "$gt":
              rc = rc && v > formator[i];
              break;

             case "$gte":
              rc = rc && v >= formator[i];
              break;

             case "$lt":
              rc = rc && v < formator[i];
              break;

             case "$lte":
              rc = rc && v <= formator[i];
              break;

             case "$eq":
              rc = rc && v == formator[i];
              break;

             case "$in":
              rc = rc && formator.indexOf(v) > -1;
              break;

             default:
              rc = false;
            }
            v = rc;
          } else v = false;
        } catch (error) {
          console.log(error);
        }
        this.node.active = v;
      },
      labelFunc: function labelFunc(v) {
        var label = this.label;
        this.label || (label = this.label = this.node.getComponent(cc.Label));
        if (label) {
          var val = v;
          this.formator && (val = "string" == typeof this.formator ? this.formator.format ? this.formator.format(val) : this.formator.replace("%s", val) : this.formator(val));
          label.string = val;
        }
      },
      editBoxFunc: function editBoxFunc(v) {
        var editBox = this.node.getComponent(cc.EditBox);
        if (editBox && editBox.string != v) {
          editBox.string = v;
          this.node.dispatchEvent(new cc.Event.EventCustom("text-changed", true));
        }
      },
      nodeFunc: function nodeFunc(v) {
        for (var _i = this.node.getChildrenCount() - 1; _i >= 0; _i--) this.np.put(this.node._children[_i]);
        if (v) if ("undefined" != typeof v.length) for (var _i2 = 0; _i2 < v.length; _i2++) this.np.get(null, v[_i2], _i2); else for (var i in v) this.np.get(null, v[i], i);
      },
      spriteFunc: function spriteFunc(v) {
        var sprite = this.sprite;
        this.sprite || (sprite = this.sprite = this.node.getComponent(cc.Sprite));
        if (sprite) {
          if (this.formator) if ("function" == typeof this.formator) v = this.formator(v); else try {
            var formator = JSON.parse(this.formator);
            if (formator.yes && formator.no) {
              var rc = true;
              var yes = void 0, no = void 0;
              v -= 0;
              if ("NaN" != parseFloat(v).toString()) for (var i in formator) switch (i) {
               case "$gt":
                rc = v > formator[i].num;
                break;

               case "$gte":
                rc = rc && v >= formator[i];
                break;

               case "$lt":
                rc = rc && v < formator[i];
                break;

               case "$lte":
                rc = rc && v <= formator[i];
                break;

               case "$eq":
                rc = rc && v == formator[i];
                break;

               case "$in":
                rc = rc && formator.indexOf(v) > -1;
                break;

               case "yes":
                yes = formator[i];
                break;

               case "no":
                no = formator[i];
              } else rc = false;
              v = rc ? yes : no;
            }
          } catch (error) {
            console.log(error);
          }
          sprite.spriteFrame = this.spriteFrame[v] || null;
        }
      },
      toggleFunc: function toggleFunc(v) {
        this.toggle.forEach(function(one) {
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
      onDestroy: function onDestroy() {
        var theV = this.val.split(".");
        "this" == theV[0] && theV.shift();
        theV.shift();
        this.baseObj.unmap(theV.join("."), this.func);
        this.baseObj = null;
        if (this.nodePoolList) while (this.nodePoolList.length > 0) {
          this.nodePoolList[0].clear();
          this.nodePoolList.splice(0, 1);
        }
      },
      getJs: function getJs(node, pre) {
        var comp = node._components || [];
        for (var i = 0; i < comp.length; i++) {
          var name = comp[i].name.split("<");
          if (2 == name.length) {
            if (0 == name[1].indexOf(pre || "pf")) return comp[i];
            if (0 == name[1].indexOf("ly")) return comp[i];
            if (0 == name[1].indexOf(name[0])) return comp[i];
          }
        }
        return null;
      },
      createNodePool: function createNodePool(prefab, target) {
        this.nodePoolList = this.nodePoolList || [];
        var np = new cc.NodePool();
        var getJs = this.getJs;
        this.nodePoolList.push(np);
        return {
          get: function get(tt, parm, idx) {
            0 == np.size() && np.put(cc.instantiate(prefab));
            var one = np.get();
            var oneJs = getJs(one);
            one.parent = tt || target;
            oneJs && oneJs.init && parm && oneJs.init(parm, idx);
            return one;
          },
          put: function put(item) {
            np.put(item);
          },
          clear: function clear(tt) {
            var children = (tt || target).children;
            for (var i = children.length - 1; i >= 0; i--) np.put(children[i]);
          },
          size: function size() {
            return np.size();
          },
          add: function add() {
            np.put(cc.instantiate(prefab));
          }
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  init: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3691aqumkVHbJPKCHgY4Rvq", "init");
    "use strict";
    window.bind = require("bind");
    window.ge = {
      createBind: function createBind(obj) {
        return bind(obj);
      }
    };
    cc._RF.pop();
  }, {
    bind: "bind"
  } ],
  pfBtn: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a1038i9BfBPpLXhwHukpWY1", "pfBtn");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        txt: cc.Label
      },
      init: function init(parm) {
        this.txt.string = parm.name;
        this.node.on("click", function() {
          parm.scene && cc.director.loadScene(parm.scene);
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  scActive: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2199dJGLUFPabEo0VuJLP1Y", "scActive");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node,
        editBox: cc.EditBox
      },
      onLoad: function onLoad() {
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        this.node.input = ge.createBind({
          num: ""
        });
        this.node.isTimesOf3 = function(v) {
          if ("NaN" == parseFloat(v).toString()) return false;
          return v % 3 == 0;
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  scClick: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1e9a47zX7dNabyQ17vVwPCw", "scClick");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node
      },
      onLoad: function onLoad() {
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        var action = ge.createBind({
          color: ""
        });
        this.node.action = action;
        this.node.click = function(v, tag) {
          action.color = tag;
        };
        this.node.txtFormat = function(v) {
          return v ? "\u4f60\u70b9\u4e86" + v : "\u8bf7\u9009\u62e9\u4f60\u559c\u6b22\u7684\u989c\u8272";
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  scDync: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a7a9ezsoVRA8Y3fKEIE6pJy", "scDync");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node,
        txtCounter: cc.Label,
        btn: cc.Node,
        btnTxt: cc.Label
      },
      onLoad: function onLoad() {
        var _this = this;
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        this.counter = ge.createBind({
          dt: 0,
          ms: 100,
          control: {
            times: 0
          }
        });
        this.bindData();
        this.btn.on("click", function() {
          "\u89e3\u7ed1" == _this.btnTxt.string ? _this.unbindData() : _this.bindData();
        });
      },
      bindData: function bindData() {
        var _this2 = this;
        this.func || (this.func = function() {
          _this2.txtCounter.string = _this2.counter.control.times;
        });
        this.btnTxt.string = "\u89e3\u7ed1";
        this.counter.map("control.times", this.func);
      },
      unbindData: function unbindData() {
        if (!this.func) return;
        this.btnTxt.string = "\u7ed1\u5b9a";
        this.counter.unmap("control.times", this.func);
      },
      update: function update(dt) {
        var counter = this.counter;
        counter.dt += 1e3 * dt;
        if (counter.dt >= counter.ms) {
          counter.dt -= counter.ms;
          counter.control.times++;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  scGlobal: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f7c62aBp29G3aECg3kx7qLM", "scGlobal");
    "use strict";
    window.gu = ge.createBind({
      enterTimes: 0,
      clickTimes: 0
    });
    gu.click = function() {
      gu.clickTimes++;
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node
      },
      onLoad: function onLoad() {
        gu.enterTimes++;
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  scInput: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5ab2cOWsmBEzJE2stDVAwzv", "scInput");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node,
        editBox: cc.EditBox
      },
      onLoad: function onLoad() {
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        this.node.input = ge.createBind({
          txt: ""
        });
        this.node.reverseFunc = function(v) {
          return "\u53cd\u8fc7\u6765\uff08" + v.split("").reverse().join("") + "\uff09";
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  scList: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ae299N8dCRI+b5RUrAdq6me", "scList");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node,
        editBox: cc.EditBox
      },
      onLoad: function onLoad() {
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        var todos = ge.createBind({
          next: "",
          list: [ "\u660e\u5929\u8bb0\u5f97\u7761\u61d2\u89c9" ]
        });
        this.editBox.node.on("editing-return", function() {
          todos.list.push(todos.next);
          todos.next = "";
        });
        this.node.todos = todos;
      }
    });
    cc._RF.pop();
  }, {} ],
  scMain: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5d785xJhdtMba/IuZWnmSZo", "scMain");
    "use strict";
    require("init");
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        this.node.btnsList = ge.createBind({
          btns: [ {
            name: "\u8f93\u5165\u540c\u6b65",
            scene: "scInput"
          }, {
            name: "\u663e\u793a\u548c\u9690\u85cf",
            scene: "scActive"
          }, {
            name: "\u70b9\u51fb\u4e8b\u4ef6",
            scene: "scClick"
          }, {
            name: "\u56fe\u7247\u5207\u6362",
            scene: "scSprite"
          }, {
            name: "\u6570\u7ec4\u5217\u8868",
            scene: "scList"
          }, {
            name: "\u5206\u9875\u680f",
            scene: "scTab"
          }, {
            name: "\u5168\u5c40\u7ed1\u5b9a",
            scene: "scGlobal"
          }, {
            name: "\u52a8\u6001\u4ee3\u7801\u7ed1\u5b9a",
            scene: "scDync"
          } ]
        });
      }
    });
    cc._RF.pop();
  }, {
    init: "init"
  } ],
  scSprite: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "19c34rGSqhHX4hUjQuqJRuW", "scSprite");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node
      },
      onLoad: function onLoad() {
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        this.node.deer = ge.createBind({
          ms: 100,
          num: 4,
          idx: 0
        });
        this.dt = 0;
      },
      update: function update(dt) {
        this.dt += 1e3 * dt;
        var deer = this.node.deer;
        if (this.dt >= deer.ms) {
          this.dt -= deer.ms;
          deer.idx = (deer.idx + 1) % deer.num;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  scTab: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "05f82EIgzRKZ6U5KAilrZk7", "scTab");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnBack: cc.Node,
        txt: cc.Label
      },
      onLoad: function onLoad() {
        var _this = this;
        this.btnBack.on("click", function() {
          cc.director.loadScene("scMain");
        });
        this.node.tabs = ge.createBind({
          idx: 0
        });
        this.node.select = function(idx) {
          _this.txt.string = "\u60a8\u9009\u62e9\u4e86\n" + [ "\u56fd\u738b", "\u7687\u540e", "\u9a91\u58eb", "\u4fee\u9053\u58eb" ][idx];
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  toDoItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9dd71VPTwhBw6CGc9ai9/Vg", "toDoItem");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        date: cc.Label,
        txt: cc.Label,
        close: cc.Node
      },
      init: function init(parm, idx) {
        var date = new Date();
        this.date.string = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        this.txt.string = parm;
        this.node.closeMe = function(val) {
          val && val.splice(idx, 1);
        };
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "init", "bind", "ccBind", "scActive", "scClick", "scDync", "scGlobal", "scInput", "scList", "toDoItem", "pfBtn", "scMain", "scSprite", "scTab" ]);