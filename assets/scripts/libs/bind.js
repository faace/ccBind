// 'use strict';
// Author：faace
// QQ: 5615830
// 说明：
// 双向绑定的原始功能是拷贝了这个工程 https://blog.csdn.net/wangweianger/article/details/80294297
// 不过他是针对html设计的，所以我改装了一下，把和html相关的功能都抽走了。
// 只留下双向绑定的getter setter功能，回调功能和英文注释：），并且优化了一些代码。
// 对应于cocos creator的使用场景，是放在ccBind.js里面，直接拖到指定的节点就可以绑定。


module.exports = function (obj2, mapping) {
    var debug = false; // true;

    var array = [];
    var isArray = Array.isArray;

    var isObject = function (o) { return typeof o == 'object' };

    // quicker forEach, also means I can use the same forEach on nodes, etc.
    function forEach(subject, fn) {
        var length = subject.length;
        for (var i = 0; i < length; i++) {
            fn(subject[i], i, subject);
        }
    }

    function __export(target, object) {
        if (!(object instanceof Object)) {
            return object; // this is a primative
        }

        forEach(Object.getOwnPropertyNames(object), function (key) {
            var value = object[key];

            // ignore properties on the prototype (pretty sure there's a better way)
            if (Bind.prototype[key] || key === '__callback') {
                return;
            }

            if (isObject(value) && value !== null && value instanceof Array) {
                target[key] = [].map.call(value, function (value) {
                    return value instanceof Object ? __export(target[key] || {}, value) : value;
                });
            } else if (isObject(value) && value !== null && !isArray(value) && value.toString() === '[Object object]') {
                target[key] = __export(target[key] || {}, value);
            } else {
                target[key] = value;
            }
        });

        return target;
    }

    // create an array like object that mirrors all the modifying array methods
    // so that we can hook into and call our callback action when it's changed.
    function AugmentedArray(callback, settings) {
        var methods = 'pop push reverse shift sort splice unshift'.split(' ');
        forEach(methods, function eachArrayMethod(method) {
            this[method] = function augmentedMethod() {
                // flag that we're about to change (used later in bind)
                this.__dirty = true;

                var ret = __export({}, array[method].apply(this, arguments));
                delete this.__dirty;
                if (callback && settings.ready) {
                    callback(this);
                }

                return ret;
            }.bind(this);
        }.bind(this));

        var length = this.length;

        Object.defineProperty(this, 'length', {
            configurable: false, // don't allow it to be deleted
            enumerable: true,
            set: function (v) {
                if (this.__dirty) {
                    length = v;
                    // now let the native array do it's thing
                    return;
                }
                var newLength = v * 1; // do a simple coersion
                // note: if `v` is a fraction, then it *should* throw an exception
                // "Invalid array length" but we don't support right now.
                if (length !== newLength) {
                    if (newLength > length) {
                        this.push.apply(this, new Array(newLength - length));
                    } else {
                        this.splice(newLength);
                    }

                    length = newLength;
                }

                return v;
            },
            get: function () {
                return length;
            },
        });
        return this;
    }

    // then lift the rest of the methods from a new array object
    AugmentedArray.prototype = [];

    // this is the main body of the bind library, and it is called recursively
    // as we go deeper into the object.
    // target is our result
    // object is the source values
    // settings is bind's settings (which contains mapping and callbacks)
    // _path is a representation of the object path from the root
    function extend(target, object, settings, _path) {
        if (!_path) _path = [];

        if (settings.ready && object.__callback) return target;

        if (object instanceof Bind) return object; // don't rebind


        // this is a conditional because we're also supporting node environment
        var $;

        // loop through each property, and make getters & setters for
        // each type of "regular" value. If the key/value pair is an
        // object, then recursively call extend with the target and
        // object as the next level down.
        forEach(Object.getOwnPropertyNames(object), function eachProp(key) {
            if (key === '__callback') return; // ignore our special hooks

            var value = object[key];
            var path = [].slice.call(_path); // create a new copy of the mapping path
            var callback;

            // now create a path, so that obj { user: { name: xxx }} is
            // user.name when joined later.
            path.push(key);

            var selector = settings.mapping[path.join('.')];

            if (debug) {
                console.log('key: %s / %s', key, path.join('.'), selector);
            }

            // then we've got an advanced config - rather than 1-1 mapping
            if (selector && selector.toString() === '[object Object]') {
                if (selector.callback) callback = selector.callback;
            } else if (typeof selector === 'function') callback = selector;

            if (callback) {
                path.reduce(function (prev, curr, i, all) {
                    if (!prev[curr]) prev[curr] = { __callback: [] };

                    // if we're at the tip then add the callback
                    if (i === all.length - 1) {
                        prev[curr].__callback.push(callback);
                    }

                    return prev[curr];
                }, settings.callbacks);

            }

            // now that the callback has been configured, wrap it to ensure that
            // it's always callable, but also then fires a callback on it's parent
            var findCallback = function findCallback(value) {
                var callbacks = [];
                var values = [];
                var instance = settings.instance;
                var dirty = false;
                var always = false;

                if (debug) {
                    console.log('> finding callback for %s', key, path);
                }

                path.reduce(function (prev, curr, i) {
                    if (prev && prev[curr] && curr) {
                        instance = instance[curr];

                        if (instance === null || instance === undefined) return prev[curr] || {}; // 只有一层

                        if (prev[curr].__callback) {
                            var v = (i === path.length - 1) ? value : instance;

                            if (instance.__dirty) dirty = true;

                            if (i === path.length - 1) {
                                always = {
                                    path: path.join('.'),
                                    callback: prev[curr].__callback,
                                    instance: __export(v instanceof Array ? [] : {}, v),
                                };
                            }

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
                    callbacks.reverse().forEach(function (fns, i) {
                        var v = values[i];
                        var stop = false;
                        fns.forEach(function (fn, i) {
                            if (!stop) stop = fn.call(settings.instance, v);
                        });
                    });
                }

                if (dirty && always) {
                    always.callback.forEach(function (fn) {
                        fn.call(settings.instance, always.instance);
                    });
                }
            };

            // set up a setter and getter for this property.
            // if the set value is another object, iterate over it, re-extending
            // so it gets these setters and getters on the set object properties.
            // when the setter is called, check if there's a callback, if so: fire.
            var definition = {
                // configurable to allow object properties to be later deleted
                configurable: true,
                enumerable: true,
                set: function (v) {
                    var old = value !== v ? value : undefined;

                    // 需要把old对应的监听路径都删除掉
                    // path callback

                    // if the value we're setting is an object, enumerate the properties
                    // and apply new setter & getters, returning our bound object
                    if (settings.ready && isObject(v) && v !== null && !isArray(v) && !v.__callback) {
                        value = extend(target[key] ? __export({}, target[key]) : {}, v,
                            settings, path);
                    } else if (isArray(v)) {
                        value = extend(new AugmentedArray(findCallback, settings), v, settings, path);
                    } else {
                        value = v;
                    }

                    if (debug) {
                        console.log('set: key(%s): %s -> %s', key, JSON.stringify(old), JSON.stringify(v));
                    }

                    // expose the callback so that child properties can call the
                    // parent callback function
                    // if (target[key] instanceof Object && !target[key].__callback) {
                    //   target[key].__callback = findCallback;
                    // }

                    // only fire the callback immediately when the initial data binding
                    // is set up. If it's not, then defer until complete
                    if (settings.ready) {
                        // this is a run-time change
                        findCallback(value);
                    } else {
                        // defer the callback until we're fully booted
                        if (typeof settings.mapping[path.join('.')] !== 'undefined') {
                            settings.deferred.push(findCallback.bind(target, value, old));
                        }
                    }
                },
                get: function () {
                    return value;
                },
            };

            // don't die trying...
            try {
                Object.defineProperty(target, key, definition);
            } catch (e) {
                if (debug) {
                    console.log('failed on Object.defineProperty', e.toString(), e.stack);
                }
            }

            // finally, set the target aka the returned value's property to the value
            // we're iterating over. note that this means the callbacks are fired
            // right away - so we defer the callbacks on first run until the set up is
            // finished.
            if (isObject(value) && value !== null && !isArray(value)) {
                target[key] = extend(target[key] || {}, value, settings, path);
            } else if (isArray(value)) {
                target[key] = extend(new AugmentedArray(findCallback, settings), value, settings, path);
            } else if (target instanceof AugmentedArray) {
                // do nothing
            } else {
                target[key] = value;
            }
        });

        if (target instanceof AugmentedArray) {
            target.push.apply(target, object);
        }

        return target;
    }



    var settings = {
        mapping: mapping || {},
        callbacks: {},
        deferred: [],
        ready: false,
    };

    function Bind(obj) {
        settings.instance = this;
        extend(this, obj, settings);

        // allow object updates to happen now, otherwise we end up iterating the
        // setter & getter methods, which causes multiple callbacks to run
        settings.ready = true;

        // if there's deferred callbacks, let's hit them now the binding is set up
        if (settings.deferred.length) {
            // note: this callback will fire right away, so the callbacks
            // may not want to directly reference the returned object,
            // but reference the passed in "new" value or `this` keyword
            // this can be worked around by wrapping the following code
            // in a setTimeout(fn, 0) - but this means any changes that are
            // synchonous in the code that creates the bind object, will
            // run *before* this callback loop runs. Basically: race.
            forEach(settings.deferred, function deferreds(fn) {
                fn();
            });
        }

        return this;
    }

    // returns a vanilla object - without setters & getters
    Bind.prototype.__export = function () {
        return __export({}, this);
    };
    Bind.prototype.map = function (path, selector) { // bind a function
        var callback;
        path = path.split('.');
        if (selector && selector.toString() === '[object Object]') {
            if (selector.callback) callback = selector.callback;
        } else if (typeof selector === 'function') callback = selector;

        if (callback) {
            let that = this;
            path.reduce(function (prev, curr, i, all) {
                that = that[curr];
                if (!prev[curr]) prev[curr] = { __callback: [] };

                // if we're at the tip then add the callback
                if (i === all.length - 1) {
                    prev[curr].__callback.push(callback);
                    callback(that);
                }

                return prev[curr];
            }, settings.callbacks);

        }
    };
    Bind.prototype.unmap = function (path, selector) { // bind a function
        var callback;
        path = path.split('.');
        if (selector && selector.toString() === '[object Object]') {
            if (selector.callback) callback = selector.callback;
        } else if (typeof selector === 'function') callback = selector;

        if (callback) {
            path.reduce(function (prev, curr, i, all) {
                if (!prev[curr]) prev[curr] = { __callback: [] };

                // if we're at the tip then add the callback
                if (i === all.length - 1) {
                    let __callback = prev[curr].__callback;
                    for (let i = 0; i < __callback.length; i++) {
                        if (__callback[i]._uid == callback._uid) {
                            __callback.splice(i, 1);
                            break;
                        }
                    }
                    // let idx = prev[curr].__callback.indexOf(callback);
                    // if (idx > -1) prev[curr].__callback.splice(idx, 1);
                }

                return prev[curr];
            }, settings.callbacks);

        }
    };
    Bind.prototype.getVal = function (path) {
        path = path.split('.');
        var val;
        if (path.length > 0) {
            val = this[path[0]];
            for (let i = 1; i < path.length; i++) {
                if (val) val = val[path[i]];
                else break;
            }
        }
        return val;
    };
    Bind.prototype.forEach = function (cb) { // 遍历，如果中途要退出，cb就返回true
        if (!cb) return;
        for (let i in this) {
            if (this.hasOwnProperty(i)) {
                if (cb(i, this[i])) break;
            }
        }
    };
    Bind.prototype.isBind = function () {
        return this instanceof Bind;
    };

    return new Bind(obj2);
};

