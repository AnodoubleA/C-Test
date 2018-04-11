(function () {

    //==================================================================================================================
    //declare a directive of 'tab'.
    //==================================================================================================================


    (function () {

        var SKIP = "skip";
        var BEFORE_SWITCH = "beforeswitch";
        var AFTER_SWITCH = "afterswitch";

        /**
         * Class of Tab.
         * Any time, just one tab is activated.
         * @constructor
         */
        function Tab() {
            this.name = "tab";
            this.hiddenClass = "hidden";
            this.activeClass = "active";
            this.activeAttribute = "active";
            this.map = new Map();
            this.current = null;
            this.active = null;
            this.content = null;
            this.interceptor = null;
            this.root = document;
            this.node = null;
            this.context = null;
            this.duplicateSwitch = false;
        }

        Tab.prototype.reset = function () {
            this.map.clear();
        };

        Tab.prototype.init = function (binding, node) {
            this.node = node;
            this.context = node.context;
            var value = binding.value || {};
            this.duplicateSwitch = value.duplicateSwitch;
            var target = value.target;
            if (target) {
                var dom = document.querySelector(target);
                if (dom != null) {
                    this.root = dom;
                }
            }
            var interceptor = value.interceptor;
            if (interceptor) {
                if (!(interceptor instanceof Function)) {
                    interceptor = evals(interceptor);
                }
                if (interceptor instanceof Function) {
                    this.interceptor = interceptor;
                }
            }
            this.map.clear();
            this.collect(node);
            var init = value.init;
            if (init instanceof Function) {
                init(this);
            }
            if (this.active != null && value.autoActive !== false) {
                this.switch(this.active);
            }
        };

        /**
         * Recursion collect all tab item and storage it.
         *
         * @param parent the parent element.
         */
        Tab.prototype.collect = function (parent) {
            var nodes = parent.children;
            if (nodes == null) {
                nodes = (parent.componentInstance && parent.componentInstance._vnode.children);
            }
            var size = nodes && nodes.length;
            for (var i = 0; i < size; i++) {
                var node = nodes[i];
                var attrs = node.data && node.data.attrs;
                if (attrs && (this.name in attrs)) {
                    this.process(node);
                }
                if (hasChild(node)) {
                    this.collect(node);
                }
            }
        };

        /**
         * Process one tab item at collect period.
         * @param node
         */
        Tab.prototype.process = function (node) {
            this.map.set(node.elm, node);
            var self = this;
            node.elm.addEventListener("click", function (evt) {
                self.switch(self.map.get(evt.currentTarget), evt);
            });
            var data = node.data;
            if (!this.active) this.active = node;
            if (this.activeAttribute in data.attrs) {
                this.active = node;
            }
            var dom = getElementBy(data.attrs[this.name], this.root);
            if (dom) {
                dom.classList.add(this.hiddenClass);
                dom.classList.remove(this.activeClass);
            }
        };

        /**
         * Switch the tab, but the tab maybe intercepted.
         * @param now the tab witch to switch to.
         * @param evt src event like click event.
         */
        Tab.prototype.switch = function (now, evt) {
            if (this.current === now && this.duplicateSwitch !== true) return;
            if (this.interceptor instanceof Function) {
                if (!(SKIP in (now.data && now.data.attrs))) {
                    if (this.interceptor(now, this.current, this) === false) return;
                }
            }
            this.trySwitch(now, evt);
        };

        /**
         * Try switch tab, before switch, global interceptor will be call.
         * If continue, beforeSwitch event will be call. If not intercepted, then do switch really.
         * @param now
         * @param evt
         */
        Tab.prototype.trySwitch = function (now, evt) {
            var beforeSwitch = now.data.on && now.data.on[BEFORE_SWITCH];
            if (beforeSwitch) {
                var event = {now: now, old: this.current, switched: false, tab: this, event: evt};
                beforeSwitch(event);
                if (event.allow === false) return;
            }
            this.doSwitch(now);
        };

        /**
         * At this now, tab will be switch really, you can do nothing to change it.
         *
         * So afterSwitch event will be call at after tab switched.
         * @param now
         */
        Tab.prototype.doSwitch = function (now) {
            now.elm.classList.add(this.activeClass);
            var newContent = now.data.content;
            if (newContent == null) {
                newContent = now.data.content = getElementBy(now.data.attrs[this.name], this.root);
            }
            if (newContent != null) {
                newContent.classList.add(this.activeClass);
                newContent.classList.remove(this.hiddenClass);
            }
            var old = this.current;
            if (old != null) {
                old.elm.classList.remove(this.activeClass);
            }
            this.current = now;
            var content = this.content;
            if (newContent && content && newContent !== content) {
                content.classList.add(this.hiddenClass);
                content.classList.remove(this.activeClass);
            }
            if (newContent) {
                this.content = newContent;
            }
            var afterSwitch = now.data.on && now.data.on[AFTER_SWITCH];
            if (afterSwitch) {
                afterSwitch({now: now, old: old, switched: true, tab: this});
            }
        };

        /**
         * Declare a directive of 'tab', provide tab switch.
         *
         * Each tab may have a content to show, attr 'tab' it's value set to it(id or class or some selector).
         *
         * Eg.
         * <li tab='#conentId'></li>
         */
        Vue.directive("tab", {
            bind: function (el, binding) {
                binding.tab = new Tab();
            },
            inserted: function (el, binding, node) {
                binding.tab.init(binding, node);
            }
        });
    })();
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // utils
    function hasChild(node) {
        return (node.elm.nodeType !== 3) && (node.children || (node.componentInstance && node.componentInstance._vnode.children));
    }

    function getElementBy(selector, root) {
        if (selector === "") return null;
        return (root || document).querySelector(selector);
    }
})();
