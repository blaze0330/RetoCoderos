
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    const num = writable("4915666431345739");
    const name = writable("Juan Fernando");
    const month = writable("04");
    const year = writable("20");
    const ccv = writable("434");

    const isValid = writable(false);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var lib = createCommonjsModule(function (module) {
    // Generated by CoffeeScript 1.10.0
    (function() {
      var QJ, rreturn, rtrim;

      QJ = function(selector) {
        if (QJ.isDOMElement(selector)) {
          return selector;
        }
        return document.querySelectorAll(selector);
      };

      QJ.isDOMElement = function(el) {
        return el && (el.nodeName != null);
      };

      rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

      QJ.trim = function(text) {
        if (text === null) {
          return "";
        } else {
          return (text + "").replace(rtrim, "");
        }
      };

      rreturn = /\r/g;

      QJ.val = function(el, val) {
        var ret;
        if (arguments.length > 1) {
          return el.value = val;
        } else {
          ret = el.value;
          if (typeof ret === "string") {
            return ret.replace(rreturn, "");
          } else {
            if (ret === null) {
              return "";
            } else {
              return ret;
            }
          }
        }
      };

      QJ.preventDefault = function(eventObject) {
        if (typeof eventObject.preventDefault === "function") {
          eventObject.preventDefault();
          return;
        }
        eventObject.returnValue = false;
        return false;
      };

      QJ.normalizeEvent = function(e) {
        var original;
        original = e;
        e = {
          which: original.which != null ? original.which : void 0,
          target: original.target || original.srcElement,
          preventDefault: function() {
            return QJ.preventDefault(original);
          },
          originalEvent: original,
          data: original.data || original.detail
        };
        if (e.which == null) {
          e.which = original.charCode != null ? original.charCode : original.keyCode;
        }
        return e;
      };

      QJ.on = function(element, eventName, callback) {
        var el, i, j, len, len1, multEventName, originalCallback, ref;
        if (element.length) {
          for (i = 0, len = element.length; i < len; i++) {
            el = element[i];
            QJ.on(el, eventName, callback);
          }
          return;
        }
        if (eventName.match(" ")) {
          ref = eventName.split(" ");
          for (j = 0, len1 = ref.length; j < len1; j++) {
            multEventName = ref[j];
            QJ.on(element, multEventName, callback);
          }
          return;
        }
        originalCallback = callback;
        callback = function(e) {
          e = QJ.normalizeEvent(e);
          return originalCallback(e);
        };
        if (element.addEventListener) {
          return element.addEventListener(eventName, callback, false);
        }
        if (element.attachEvent) {
          eventName = "on" + eventName;
          return element.attachEvent(eventName, callback);
        }
        element['on' + eventName] = callback;
      };

      QJ.addClass = function(el, className) {
        var e;
        if (el.length) {
          return (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = el.length; i < len; i++) {
              e = el[i];
              results.push(QJ.addClass(e, className));
            }
            return results;
          })();
        }
        if (el.classList) {
          return el.classList.add(className);
        } else {
          return el.className += ' ' + className;
        }
      };

      QJ.hasClass = function(el, className) {
        var e, hasClass, i, len;
        if (el.length) {
          hasClass = true;
          for (i = 0, len = el.length; i < len; i++) {
            e = el[i];
            hasClass = hasClass && QJ.hasClass(e, className);
          }
          return hasClass;
        }
        if (el.classList) {
          return el.classList.contains(className);
        } else {
          return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
      };

      QJ.removeClass = function(el, className) {
        var cls, e, i, len, ref, results;
        if (el.length) {
          return (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = el.length; i < len; i++) {
              e = el[i];
              results.push(QJ.removeClass(e, className));
            }
            return results;
          })();
        }
        if (el.classList) {
          ref = className.split(' ');
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            cls = ref[i];
            results.push(el.classList.remove(cls));
          }
          return results;
        } else {
          return el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      };

      QJ.toggleClass = function(el, className, bool) {
        var e;
        if (el.length) {
          return (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = el.length; i < len; i++) {
              e = el[i];
              results.push(QJ.toggleClass(e, className, bool));
            }
            return results;
          })();
        }
        if (bool) {
          if (!QJ.hasClass(el, className)) {
            return QJ.addClass(el, className);
          }
        } else {
          return QJ.removeClass(el, className);
        }
      };

      QJ.append = function(el, toAppend) {
        var e;
        if (el.length) {
          return (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = el.length; i < len; i++) {
              e = el[i];
              results.push(QJ.append(e, toAppend));
            }
            return results;
          })();
        }
        return el.insertAdjacentHTML('beforeend', toAppend);
      };

      QJ.find = function(el, selector) {
        if (el instanceof NodeList || el instanceof Array) {
          el = el[0];
        }
        return el.querySelectorAll(selector);
      };

      QJ.trigger = function(el, name, data) {
        var ev;
        try {
          ev = new CustomEvent(name, {
            detail: data
          });
        } catch (error) {
          ev = document.createEvent('CustomEvent');
          if (ev.initCustomEvent) {
            ev.initCustomEvent(name, true, true, data);
          } else {
            ev.initEvent(name, true, true, data);
          }
        }
        return el.dispatchEvent(ev);
      };

      module.exports = QJ;

    }).call(commonjsGlobal);
    });

    var lib$1 = createCommonjsModule(function (module) {
    // Generated by CoffeeScript 1.10.0
    (function() {
      var Payment, QJ, cardFromNumber, cardFromType, cards, defaultFormat, formatBackCardNumber, formatBackExpiry, formatCardNumber, formatExpiry, formatForwardExpiry, formatForwardSlash, formatMonthExpiry, hasTextSelected, luhnCheck, reFormatCardNumber, restrictCVC, restrictCardNumber, restrictCombinedExpiry, restrictExpiry, restrictMonthExpiry, restrictNumeric, restrictYearExpiry, setCardType,
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      QJ = lib;

      defaultFormat = /(\d{1,4})/g;

      cards = [
        {
          type: 'amex',
          pattern: /^3[47]/,
          format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
          length: [15],
          cvcLength: [4],
          luhn: true
        }, {
          type: 'dankort',
          pattern: /^5019/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'hipercard',
          pattern: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
          format: defaultFormat,
          length: [14, 15, 16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'dinersclub',
          pattern: /^(36|38|30[0-5])/,
          format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
          length: [14],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'discover',
          pattern: /^(6011|65|64[4-9]|622)/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'jcb',
          pattern: /^35/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'laser',
          pattern: /^(6706|6771|6709)/,
          format: defaultFormat,
          length: [16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'maestro',
          pattern: /^(5018|5020|5038|6304|6703|6708|6759|676[1-3])/,
          format: defaultFormat,
          length: [12, 13, 14, 15, 16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'mastercard',
          pattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'unionpay',
          pattern: /^62/,
          format: defaultFormat,
          length: [16, 17, 18, 19],
          cvcLength: [3],
          luhn: false
        }, {
          type: 'visaelectron',
          pattern: /^4(026|17500|405|508|844|91[37])/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'elo',
          pattern: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'visa',
          pattern: /^4/,
          format: defaultFormat,
          length: [13, 16, 19],
          cvcLength: [3],
          luhn: true
        }
      ];

      cardFromNumber = function(num) {
        var card, j, len;
        num = (num + '').replace(/\D/g, '');
        for (j = 0, len = cards.length; j < len; j++) {
          card = cards[j];
          if (card.pattern.test(num)) {
            return card;
          }
        }
      };

      cardFromType = function(type) {
        var card, j, len;
        for (j = 0, len = cards.length; j < len; j++) {
          card = cards[j];
          if (card.type === type) {
            return card;
          }
        }
      };

      luhnCheck = function(num) {
        var digit, digits, j, len, odd, sum;
        odd = true;
        sum = 0;
        digits = (num + '').split('').reverse();
        for (j = 0, len = digits.length; j < len; j++) {
          digit = digits[j];
          digit = parseInt(digit, 10);
          if ((odd = !odd)) {
            digit *= 2;
          }
          if (digit > 9) {
            digit -= 9;
          }
          sum += digit;
        }
        return sum % 10 === 0;
      };

      hasTextSelected = function(target) {
        var ref;
        try {
          if ((target.selectionStart != null) && target.selectionStart !== target.selectionEnd) {
            return true;
          }
          if ((typeof document !== "undefined" && document !== null ? (ref = document.selection) != null ? ref.createRange : void 0 : void 0) != null) {
            if (document.selection.createRange().text) {
              return true;
            }
          }
        } catch (error) {
        }
        return false;
      };

      reFormatCardNumber = function(e) {
        return setTimeout((function(_this) {
          return function() {
            var target, value;
            target = e.target;
            value = QJ.val(target);
            value = Payment.fns.formatCardNumber(value);
            QJ.val(target, value);
            return QJ.trigger(target, 'change');
          };
        })());
      };

      formatCardNumber = function(maxLength) {
        return function(e) {
          var card, digit, i, j, len, length, re, target, upperLength, upperLengths, value;
          digit = String.fromCharCode(e.which);
          if (!/^\d+$/.test(digit)) {
            return;
          }
          target = e.target;
          value = QJ.val(target);
          card = cardFromNumber(value + digit);
          length = (value.replace(/\D/g, '') + digit).length;
          upperLengths = [16];
          if (card) {
            upperLengths = card.length;
          }
          if (maxLength) {
            upperLengths = upperLengths.filter(function(x) {
              return x <= maxLength;
            });
          }
          for (i = j = 0, len = upperLengths.length; j < len; i = ++j) {
            upperLength = upperLengths[i];
            if (length >= upperLength && upperLengths[i + 1]) {
              continue;
            }
            if (length >= upperLength) {
              return;
            }
          }
          if (hasTextSelected(target)) {
            return;
          }
          if (card && card.type === 'amex') {
            re = /^(\d{4}|\d{4}\s\d{6})$/;
          } else {
            re = /(?:^|\s)(\d{4})$/;
          }
          if (re.test(value)) {
            e.preventDefault();
            QJ.val(target, value + ' ' + digit);
            return QJ.trigger(target, 'change');
          }
        };
      };

      formatBackCardNumber = function(e) {
        var target, value;
        target = e.target;
        value = QJ.val(target);
        if (e.meta) {
          return;
        }
        if (e.which !== 8) {
          return;
        }
        if (hasTextSelected(target)) {
          return;
        }
        if (/\d\s$/.test(value)) {
          e.preventDefault();
          QJ.val(target, value.replace(/\d\s$/, ''));
          return QJ.trigger(target, 'change');
        } else if (/\s\d?$/.test(value)) {
          e.preventDefault();
          QJ.val(target, value.replace(/\s\d?$/, ''));
          return QJ.trigger(target, 'change');
        }
      };

      formatExpiry = function(e) {
        var digit, target, val;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          return;
        }
        target = e.target;
        val = QJ.val(target) + digit;
        if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
          e.preventDefault();
          QJ.val(target, "0" + val + " / ");
          return QJ.trigger(target, 'change');
        } else if (/^\d\d$/.test(val)) {
          e.preventDefault();
          QJ.val(target, val + " / ");
          return QJ.trigger(target, 'change');
        }
      };

      formatMonthExpiry = function(e) {
        var digit, target, val;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          return;
        }
        target = e.target;
        val = QJ.val(target) + digit;
        if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
          e.preventDefault();
          QJ.val(target, "0" + val);
          return QJ.trigger(target, 'change');
        } else if (/^\d\d$/.test(val)) {
          e.preventDefault();
          QJ.val(target, "" + val);
          return QJ.trigger(target, 'change');
        }
      };

      formatForwardExpiry = function(e) {
        var digit, target, val;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          return;
        }
        target = e.target;
        val = QJ.val(target);
        if (/^\d\d$/.test(val)) {
          QJ.val(target, val + " / ");
          return QJ.trigger(target, 'change');
        }
      };

      formatForwardSlash = function(e) {
        var slash, target, val;
        slash = String.fromCharCode(e.which);
        if (slash !== '/') {
          return;
        }
        target = e.target;
        val = QJ.val(target);
        if (/^\d$/.test(val) && val !== '0') {
          QJ.val(target, "0" + val + " / ");
          return QJ.trigger(target, 'change');
        }
      };

      formatBackExpiry = function(e) {
        var target, value;
        if (e.metaKey) {
          return;
        }
        target = e.target;
        value = QJ.val(target);
        if (e.which !== 8) {
          return;
        }
        if (hasTextSelected(target)) {
          return;
        }
        if (/\d(\s|\/)+$/.test(value)) {
          e.preventDefault();
          QJ.val(target, value.replace(/\d(\s|\/)*$/, ''));
          return QJ.trigger(target, 'change');
        } else if (/\s\/\s?\d?$/.test(value)) {
          e.preventDefault();
          QJ.val(target, value.replace(/\s\/\s?\d?$/, ''));
          return QJ.trigger(target, 'change');
        }
      };

      restrictNumeric = function(e) {
        var input;
        if (e.metaKey || e.ctrlKey) {
          return true;
        }
        if (e.which === 32) {
          return e.preventDefault();
        }
        if (e.which === 0) {
          return true;
        }
        if (e.which < 33) {
          return true;
        }
        input = String.fromCharCode(e.which);
        if (!/[\d\s]/.test(input)) {
          return e.preventDefault();
        }
      };

      restrictCardNumber = function(maxLength) {
        return function(e) {
          var card, digit, length, target, value;
          target = e.target;
          digit = String.fromCharCode(e.which);
          if (!/^\d+$/.test(digit)) {
            return;
          }
          if (hasTextSelected(target)) {
            return;
          }
          value = (QJ.val(target) + digit).replace(/\D/g, '');
          card = cardFromNumber(value);
          length = 16;
          if (card) {
            length = card.length[card.length.length - 1];
          }
          if (maxLength) {
            length = Math.min(length, maxLength);
          }
          if (!(value.length <= length)) {
            return e.preventDefault();
          }
        };
      };

      restrictExpiry = function(e, length) {
        var digit, target, value;
        target = e.target;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          return;
        }
        if (hasTextSelected(target)) {
          return;
        }
        value = QJ.val(target) + digit;
        value = value.replace(/\D/g, '');
        if (value.length > length) {
          return e.preventDefault();
        }
      };

      restrictCombinedExpiry = function(e) {
        return restrictExpiry(e, 6);
      };

      restrictMonthExpiry = function(e) {
        return restrictExpiry(e, 2);
      };

      restrictYearExpiry = function(e) {
        return restrictExpiry(e, 4);
      };

      restrictCVC = function(e) {
        var digit, target, val;
        target = e.target;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          return;
        }
        if (hasTextSelected(target)) {
          return;
        }
        val = QJ.val(target) + digit;
        if (!(val.length <= 4)) {
          return e.preventDefault();
        }
      };

      setCardType = function(e) {
        var allTypes, card, cardType, target, val;
        target = e.target;
        val = QJ.val(target);
        cardType = Payment.fns.cardType(val) || 'unknown';
        if (!QJ.hasClass(target, cardType)) {
          allTypes = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = cards.length; j < len; j++) {
              card = cards[j];
              results.push(card.type);
            }
            return results;
          })();
          QJ.removeClass(target, 'unknown');
          QJ.removeClass(target, allTypes.join(' '));
          QJ.addClass(target, cardType);
          QJ.toggleClass(target, 'identified', cardType !== 'unknown');
          return QJ.trigger(target, 'payment.cardType', cardType);
        }
      };

      Payment = (function() {
        function Payment() {}

        Payment.fns = {
          cardExpiryVal: function(value) {
            var month, prefix, ref, year;
            value = value.replace(/\s/g, '');
            ref = value.split('/', 2), month = ref[0], year = ref[1];
            if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
              prefix = (new Date).getFullYear();
              prefix = prefix.toString().slice(0, 2);
              year = prefix + year;
            }
            month = parseInt(month, 10);
            year = parseInt(year, 10);
            return {
              month: month,
              year: year
            };
          },
          validateCardNumber: function(num) {
            var card, ref;
            num = (num + '').replace(/\s+|-/g, '');
            if (!/^\d+$/.test(num)) {
              return false;
            }
            card = cardFromNumber(num);
            if (!card) {
              return false;
            }
            return (ref = num.length, indexOf.call(card.length, ref) >= 0) && (card.luhn === false || luhnCheck(num));
          },
          validateCardExpiry: function(month, year) {
            var currentTime, expiry, prefix, ref, ref1;
            if (typeof month === 'object' && 'month' in month) {
              ref = month, month = ref.month, year = ref.year;
            } else if (typeof month === 'string' && indexOf.call(month, '/') >= 0) {
              ref1 = Payment.fns.cardExpiryVal(month), month = ref1.month, year = ref1.year;
            }
            if (!(month && year)) {
              return false;
            }
            month = QJ.trim(month);
            year = QJ.trim(year);
            if (!/^\d+$/.test(month)) {
              return false;
            }
            if (!/^\d+$/.test(year)) {
              return false;
            }
            month = parseInt(month, 10);
            if (!(month && month <= 12)) {
              return false;
            }
            if (year.length === 2) {
              prefix = (new Date).getFullYear();
              prefix = prefix.toString().slice(0, 2);
              year = prefix + year;
            }
            expiry = new Date(year, month);
            currentTime = new Date;
            expiry.setMonth(expiry.getMonth() - 1);
            expiry.setMonth(expiry.getMonth() + 1, 1);
            return expiry > currentTime;
          },
          validateCardCVC: function(cvc, type) {
            var ref, ref1;
            cvc = QJ.trim(cvc);
            if (!/^\d+$/.test(cvc)) {
              return false;
            }
            if (type && cardFromType(type)) {
              return ref = cvc.length, indexOf.call((ref1 = cardFromType(type)) != null ? ref1.cvcLength : void 0, ref) >= 0;
            } else {
              return cvc.length >= 3 && cvc.length <= 4;
            }
          },
          cardType: function(num) {
            var ref;
            if (!num) {
              return null;
            }
            return ((ref = cardFromNumber(num)) != null ? ref.type : void 0) || null;
          },
          formatCardNumber: function(num) {
            var card, groups, ref, upperLength;
            card = cardFromNumber(num);
            if (!card) {
              return num;
            }
            upperLength = card.length[card.length.length - 1];
            num = num.replace(/\D/g, '');
            num = num.slice(0, upperLength);
            if (card.format.global) {
              return (ref = num.match(card.format)) != null ? ref.join(' ') : void 0;
            } else {
              groups = card.format.exec(num);
              if (groups == null) {
                return;
              }
              groups.shift();
              groups = groups.filter(function(n) {
                return n;
              });
              return groups.join(' ');
            }
          }
        };

        Payment.restrictNumeric = function(el) {
          return QJ.on(el, 'keypress', restrictNumeric);
        };

        Payment.cardExpiryVal = function(el) {
          return Payment.fns.cardExpiryVal(QJ.val(el));
        };

        Payment.formatCardCVC = function(el) {
          Payment.restrictNumeric(el);
          QJ.on(el, 'keypress', restrictCVC);
          return el;
        };

        Payment.formatCardExpiry = function(el) {
          var month, year;
          Payment.restrictNumeric(el);
          if (el.length && el.length === 2) {
            month = el[0], year = el[1];
            this.formatCardExpiryMultiple(month, year);
          } else {
            QJ.on(el, 'keypress', restrictCombinedExpiry);
            QJ.on(el, 'keypress', formatExpiry);
            QJ.on(el, 'keypress', formatForwardSlash);
            QJ.on(el, 'keypress', formatForwardExpiry);
            QJ.on(el, 'keydown', formatBackExpiry);
          }
          return el;
        };

        Payment.formatCardExpiryMultiple = function(month, year) {
          QJ.on(month, 'keypress', restrictMonthExpiry);
          QJ.on(month, 'keypress', formatMonthExpiry);
          return QJ.on(year, 'keypress', restrictYearExpiry);
        };

        Payment.formatCardNumber = function(el, maxLength) {
          Payment.restrictNumeric(el);
          QJ.on(el, 'keypress', restrictCardNumber(maxLength));
          QJ.on(el, 'keypress', formatCardNumber(maxLength));
          QJ.on(el, 'keydown', formatBackCardNumber);
          QJ.on(el, 'keyup blur', setCardType);
          QJ.on(el, 'paste', reFormatCardNumber);
          QJ.on(el, 'input', reFormatCardNumber);
          return el;
        };

        Payment.getCardArray = function() {
          return cards;
        };

        Payment.setCardArray = function(cardArray) {
          cards = cardArray;
          return true;
        };

        Payment.addToCardArray = function(cardObject) {
          return cards.push(cardObject);
        };

        Payment.removeFromCardArray = function(type) {
          var key, value;
          for (key in cards) {
            value = cards[key];
            if (value.type === type) {
              cards.splice(key, 1);
            }
          }
          return true;
        };

        return Payment;

      })();

      module.exports = Payment;

      commonjsGlobal.Payment = Payment;

    }).call(commonjsGlobal);
    });

    /* src/components/Card.svelte generated by Svelte v3.5.1 */

    const file = "src/components/Card.svelte";

    // (79:8) {#if cardType}
    function create_if_block(ctx) {
    	var img, img_src_value;

    	return {
    		c: function create() {
    			img = element("img");
    			img.src = img_src_value = ctx.cardTypes[ctx.cardType].icon;
    			img.alt = ctx.cardType;
    			img.className = "w-auto h-16";
    			add_location(img, file, 79, 10, 2524);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.cardType) && img_src_value !== (img_src_value = ctx.cardTypes[ctx.cardType].icon)) {
    				img.src = img_src_value;
    			}

    			if (changed.cardType) {
    				img.alt = ctx.cardType;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var div6, div5, div4, img, t0, div0, t1, t2, div1, t3, t4, t5, t6, div3, div2, t7, t8;

    	var if_block = (ctx.cardType) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(ctx.store_num);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(ctx.store_month);
    			t4 = text("/");
    			t5 = text(ctx.store_year);
    			t6 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t7 = text(ctx.store_name);
    			t8 = space();
    			if (if_block) if_block.c();
    			img.src = "https://cdn0.iconfinder.com/data/icons/fatcow/32/card_chip_gold.png";
    			set_style(img, "width", "32px");
    			set_style(img, "height", "32px");
    			img.alt = "Chip";
    			add_location(img, file, 68, 6, 2088);
    			div0.className = "text-center text-2xl font-medium tracking-wide";
    			add_location(div0, file, 72, 6, 2246);
    			div1.className = "text-center";
    			add_location(div1, file, 75, 6, 2347);
    			add_location(div2, file, 77, 8, 2467);
    			div3.className = "flex justify-between items-center";
    			add_location(div3, file, 76, 6, 2411);
    			div4.className = "absolute inset-0 flex flex-col justify-between p-8";
    			add_location(div4, file, 67, 4, 2017);
    			div5.className = "pt-ar relative rounded-lg shadow";
    			set_style(div5, "background", (ctx.cardType ? ctx.cardTypes[ctx.cardType].background : 'white'));
    			set_style(div5, "color", (ctx.cardType ? ctx.cardTypes[ctx.cardType].color : '#444'));
    			add_location(div5, file, 63, 2, 1823);
    			div6.className = "w-full md:max-w-lg";
    			add_location(div6, file, 62, 0, 1788);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div4);
    			append(div4, img);
    			append(div4, t0);
    			append(div4, div0);
    			append(div0, t1);
    			append(div4, t2);
    			append(div4, div1);
    			append(div1, t3);
    			append(div1, t4);
    			append(div1, t5);
    			append(div4, t6);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, t7);
    			append(div3, t8);
    			if (if_block) if_block.m(div3, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.store_num) {
    				set_data(t1, ctx.store_num);
    			}

    			if (changed.store_month) {
    				set_data(t3, ctx.store_month);
    			}

    			if (changed.store_year) {
    				set_data(t5, ctx.store_year);
    			}

    			if (changed.store_name) {
    				set_data(t7, ctx.store_name);
    			}

    			if (ctx.cardType) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.cardType || changed.cardTypes) {
    				set_style(div5, "background", (ctx.cardType ? ctx.cardTypes[ctx.cardType].background : 'white'));
    				set_style(div5, "color", (ctx.cardType ? ctx.cardTypes[ctx.cardType].color : '#444'));
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	

      let store_num, store_name, store_month, store_year, store_ccv;

      num.subscribe(val => {
        $$invalidate('store_num', store_num = val);
      });
      name.subscribe(val => {
        $$invalidate('store_name', store_name = val);
      });
      month.subscribe(val => {
        $$invalidate('store_month', store_month = val);
      });
      year.subscribe(val => {
        $$invalidate('store_year', store_year = val);
      });
      ccv.subscribe(val => {
        $$invalidate('store_ccv', store_ccv = val);
      });

      let cardType;
      let isNumberValid = false;
      let isDateValid = false;
      let isCcvValid = false;

      let cardTypes = {
        visa: {
          background:
            "linear-gradient(28deg, rgba(26,55,113,1) 0%, rgba(81,110,153,1) 50%, rgba(26,50,113,1) 100%)",
          color: "#c4dcff",
          icon:
            "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-08-512.png"
        },
        mastercard: {
          color: "#fff0db",
          background:
            "linear-gradient(0deg, rgba(105,83,57,1) 0%, rgba(231,184,116,1) 100%)",
          icon:
            "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-07-512.png"
        },
        amex: {
          background:
            "linear-gradient(0deg, rgba(145,158,164,1) 0%, rgba(215,224,228,1) 100%)",
          color: "#3e535e",
          icon:
            "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-05-512.png"
        }
      };

    	$$self.$$.update = ($$dirty = { store_num: 1, store_ccv: 1, store_month: 1, store_year: 1, isNumberValid: 1, isCcvValid: 1, isDateValid: 1 }) => {
    		if ($$dirty.store_num || $$dirty.store_ccv || $$dirty.store_month || $$dirty.store_year || $$dirty.isNumberValid || $$dirty.isCcvValid || $$dirty.isDateValid) { {
            $$invalidate('cardType', cardType = lib$1.fns.cardType(store_num));
            $$invalidate('isNumberValid', isNumberValid = lib$1.fns.validateCardNumber(store_num));
            $$invalidate('isCcvValid', isCcvValid = lib$1.fns.validateCardCVC(store_ccv));
            $$invalidate('isDateValid', isDateValid = lib$1.fns.validateCardExpiry(store_month, store_year));
            console.log(store_num, store_month, store_year, store_ccv);
            console.log(isNumberValid, isCcvValid, isDateValid);
            isValid.set(isNumberValid && isCcvValid && isDateValid);
          } }
    	};

    	return {
    		store_num,
    		store_name,
    		store_month,
    		store_year,
    		cardType,
    		cardTypes
    	};
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/components/Form.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/components/Form.svelte";

    // (79:2) {#if isValidCC}
    function create_if_block$1(ctx) {
    	var button;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Button";
    			button.className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 w-full mt-6\n      rounded";
    			add_location(button, file$1, 79, 4, 2895);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div7, div1, div0, svg, path, t0, h2, t2, div2, label0, t4, input0, t5, div6, label1, t7, div5, div3, input1, t8, div4, input2, t9, input3, t10, input4, t11, dispose;

    	var if_block = (ctx.isValidCC) && create_if_block$1();

    	return {
    		c: function create() {
    			div7 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Your Payment Information";
    			t2 = space();
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name on card";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			div6 = element("div");
    			label1 = element("label");
    			label1.textContent = "Credit Card info";
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			input1 = element("input");
    			t8 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t9 = space();
    			input3 = element("input");
    			t10 = space();
    			input4 = element("input");
    			t11 = space();
    			if (if_block) if_block.c();
    			attr(path, "d", "M272.715,286.341H145.518c-12.538,0-22.715,10.179-22.715,22.715\n          s10.177,22.716,22.715,22.716h127.197c12.537,0,22.712-10.18,22.712-22.716S285.252,286.341,272.715,286.341z\n          M31.949,386.284\n          c0,20.079,16.264,36.34,36.34,36.34h363.421c20.078,0,36.34-16.261,36.34-36.34V113.718c0-20.079-16.262-36.343-36.34-36.343H68.29\n          c-20.077,0-36.34,16.264-36.34,36.343V386.284z\n          M97.367,122.802h305.267c11.084,0,19.99,8.909,19.99,19.991v25.438H77.375v-25.438\n          C77.375,131.711,86.28,122.802,97.367,122.802z\n          M77.375,240.914h345.249v116.292c0,11.081-8.906,19.992-19.99,19.992H97.367\n          c-11.086,0-19.991-8.911-19.991-19.992V240.914z");
    			add_location(path, file$1, 14, 8, 431);
    			attr(svg, "class", "w-full fill-current text-indigo-400");
    			attr(svg, "viewBox", "0 0 500 500");
    			add_location(svg, file$1, 13, 6, 351);
    			div0.className = "w-1/4 border-2 border-indigo-400 px-2 py-2 rounded-full font-bold\n      mr-2";
    			add_location(div0, file$1, 10, 4, 248);
    			h2.className = "text-lg font-medium text-gray-800";
    			add_location(h2, file$1, 26, 4, 1167);
    			div1.className = "flex items-center mb-4";
    			add_location(div1, file$1, 9, 2, 207);
    			label0.htmlFor = "payment";
    			label0.className = "block text text-gray-700 mb-2";
    			add_location(label0, file$1, 30, 4, 1278);
    			attr(input0, "type", "text");
    			input0.className = "w-full flex-1 text-sm bg-gray-200 text-gray-700 rounded p-3\n      focus:outline-none";
    			input0.placeholder = "John Doe";
    			add_location(input0, file$1, 33, 4, 1374);
    			div2.className = "mb-4";
    			add_location(div2, file$1, 29, 2, 1255);
    			label1.htmlFor = "payment";
    			label1.className = "block text text-gray-700 mb-2";
    			add_location(label1, file$1, 41, 4, 1576);
    			attr(input1, "type", "text");
    			input1.className = "w-full flex-1 text-sm bg-gray-200 text-gray-700 pl-3 py-3\n          focus:outline-none rounded-l sm:rounded-b-none sm:rounded-t\n          lg:rounded-r-none lg:rounded-l";
    			input1.placeholder = "Card Number";
    			input1.maxLength = "16";
    			add_location(input1, file$1, 46, 8, 1786);
    			div3.className = "flex w-1/2 sm:block sm:w-full";
    			add_location(div3, file$1, 45, 6, 1734);
    			attr(input2, "type", "text");
    			input2.className = "w-1/3 block text-sm bg-gray-200 text-gray-700 py-3\n          focus:outline-none sm:pl-3 sm:rounded-bl lg:rounded-none";
    			input2.placeholder = "MM";
    			add_location(input2, file$1, 56, 8, 2156);
    			attr(input3, "type", "text");
    			input3.className = "w-1/3 block text-sm bg-gray-200 text-gray-700 py-3\n          focus:outline-none";
    			input3.placeholder = "YY";
    			add_location(input3, file$1, 62, 8, 2389);
    			attr(input4, "type", "text");
    			input4.className = "w-1/3 block text-sm bg-gray-200 text-gray-700 py-3 pr-y\n          focus:outline-none rounded-r sm:rounded-br sm:rounded-tr-none\n          lg:rounded-r";
    			input4.placeholder = "CCV";
    			add_location(input4, file$1, 68, 8, 2583);
    			div4.className = "flex w-full lg:w-1/2";
    			add_location(div4, file$1, 55, 6, 2113);
    			div5.className = "flex flex-row sm:flex-col lg:flex-row";
    			add_location(div5, file$1, 44, 4, 1676);
    			add_location(div6, file$1, 40, 2, 1566);
    			div7.className = "bg-white shadow p-8 rounded-lg";
    			add_location(div7, file$1, 8, 0, 160);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div1);
    			append(div1, div0);
    			append(div0, svg);
    			append(svg, path);
    			append(div1, t0);
    			append(div1, h2);
    			append(div7, t2);
    			append(div7, div2);
    			append(div2, label0);
    			append(div2, t4);
    			append(div2, input0);

    			input0.value = ctx.$name;

    			append(div7, t5);
    			append(div7, div6);
    			append(div6, label1);
    			append(div6, t7);
    			append(div6, div5);
    			append(div5, div3);
    			append(div3, input1);

    			input1.value = ctx.$num;

    			append(div5, t8);
    			append(div5, div4);
    			append(div4, input2);

    			input2.value = ctx.$month;

    			append(div4, t9);
    			append(div4, input3);

    			input3.value = ctx.$year;

    			append(div4, t10);
    			append(div4, input4);

    			input4.value = ctx.$ccv;

    			append(div7, t11);
    			if (if_block) if_block.m(div7, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$name && (input0.value !== ctx.$name)) input0.value = ctx.$name;
    			if (changed.$num && (input1.value !== ctx.$num)) input1.value = ctx.$num;
    			if (changed.$month && (input2.value !== ctx.$month)) input2.value = ctx.$month;
    			if (changed.$year && (input3.value !== ctx.$year)) input3.value = ctx.$year;
    			if (changed.$ccv && (input4.value !== ctx.$ccv)) input4.value = ctx.$ccv;

    			if (ctx.isValidCC) {
    				if (!if_block) {
    					if_block = create_if_block$1();
    					if_block.c();
    					if_block.m(div7, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div7);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $name, $num, $month, $year, $ccv;

    	validate_store(name, 'name');
    	subscribe($$self, name, $$value => { $name = $$value; $$invalidate('$name', $name); });
    	validate_store(num, 'num');
    	subscribe($$self, num, $$value => { $num = $$value; $$invalidate('$num', $num); });
    	validate_store(month, 'month');
    	subscribe($$self, month, $$value => { $month = $$value; $$invalidate('$month', $month); });
    	validate_store(year, 'year');
    	subscribe($$self, year, $$value => { $year = $$value; $$invalidate('$year', $year); });
    	validate_store(ccv, 'ccv');
    	subscribe($$self, ccv, $$value => { $ccv = $$value; $$invalidate('$ccv', $ccv); });

    	let isValidCC;
      isValid.subscribe(val => {
        $$invalidate('isValidCC', isValidCC = val);
      });

    	function input0_input_handler() {
    		name.set(this.value);
    	}

    	function input1_input_handler() {
    		num.set(this.value);
    	}

    	function input2_input_handler() {
    		month.set(this.value);
    	}

    	function input3_input_handler() {
    		year.set(this.value);
    	}

    	function input4_input_handler() {
    		ccv.set(this.value);
    	}

    	return {
    		isValidCC,
    		$name,
    		$num,
    		$month,
    		$year,
    		$ccv,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	};
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	var div2, div0, t, div1, current;

    	var form = new Form({ $$inline: true });

    	var card = new Card({ $$inline: true });

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			form.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			card.$$.fragment.c();
    			div0.className = "w-full sm:w-2/5 md:w-1/2 flex items-center mb-4 sm:mb-0";
    			add_location(div0, file$2, 9, 2, 267);
    			div1.className = "w-full sm:w-3/5 md:w-1/2 flex items-center";
    			add_location(div1, file$2, 12, 2, 361);
    			div2.className = "sm:bg-red-400 md:bg-blue-400 lg:bg-green-400 xl:bg-indigo-400 flex\n  justify-center h-screen flex-col sm:flex-row px-3";
    			add_location(div2, file$2, 6, 0, 130);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(form, div0, null);
    			append(div2, t);
    			append(div2, div1);
    			mount_component(card, div1, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			form.$$.fragment.i(local);

    			card.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			form.$$.fragment.o(local);
    			card.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			form.$destroy();

    			card.$destroy();
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
