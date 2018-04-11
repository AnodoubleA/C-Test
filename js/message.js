/**
 * 提供一个对消息进行格式化的工具类。
 * @version 2.2
 * @update  2017.11.22
 * Created by Alice on 2017.02.14.
 */
//======================================================================================================================
(function (window, undefined) {
    'use strict';

    //@formatter:off
    var OPEN        = "{", CLOSE = "}" , END = "!end!";
    var OL          = OPEN.length, CL = CLOSE.length;
    var EMPTY       = "";
    var options     = {
        type: "",
        handle: multiArgHandler,
    };
    //@formatter:on

    var MAP = {};

    /**
     * A utils class. contains format operations[for now].
     * Support format see {@link MAP}
     * @constructor
     */
    function Message() {
    }

    Message.register = function (type, handler) {
        if (!(handler instanceof Function)) throw new Error("Handler not a function: " + handler);
        MAP[type] = handler;
    }

    Message.prototype.format = function (content) {
        if (!content.length) return EMPTY;
        var args = cutout(arguments, 1);
        var option = {start: 0};
        var index = 0;
        while (true) {
            var body = getBody(content, option);
            if (body === null) return content;
            if (body === END) {
                return content.replaceAt(option.start, option.end + CL, EMPTY);
            }
            var value = options.handle(body, index++, args);
            content = content.replaceAt(option.start, option.end + CL, value);
            option.start += OL;
        }
        return content;
    };

    /**
     * @Code has been changed, this comments not right.
     * 消息格式化函数，处理<code>${index,formatter,option}</code>所包含的内容。
     * 默认index是0，formatter是'f'，option是null。
     * <ul>
     * <li>如果内容为空, formatter是'f'，option是null</li>
     * <li>如果内容只有一个部分. 默认这部分就是${index},但必须是一个数字，除非：
     * <ul>
     * <li>如果内容开头以'@', 则内容就是formatter, 那么index就是0，option为null.</li>
     * <li>如果内容开头以'#', 则内容就是option, 那么index就是0, format为'p'.</li>
     * </ul>
     * </li>
     * <li>如果内容包含两个部分. 默认就是${formatter,options}
     * <ul>
     * <li>如果第一部分是数字, 则第二部分默认就是formatter, option就是null.</li>
     * <li>如果第一部分是数字, 且第二部分开头以'@', 则第二部分就是formatter,options就是null.</li>
     * <li>如果第一部分是数字, 且第二部分开头以'#', 则第二部分就是option,formatter就是'f'.</li>
     * </ul>
     * </li>
     * <li>如果内容包含三个部分.[You know what's that mean]</li>
     * </ul>
     * @param body 占位符所包含的内容
     * @param index 当前处理的索引值
     * @param args 参数集
     * @returns {String}
     */
    function multiArgHandler(body, index, args) {
        var bodies = isEmpty(body) ? [] : body.split(/,/);
        var name = options.type;
        var option = null;
        var length = bodies.length;
        if (length === 1) {
            var char = bodies[0].charAt(0);
            if (!isNaN(bodies[0])) {
                index = parseInt(bodies[0]);
            } else if (char === '@') {
                name = "p";
                option = bodies[0].substring(1);
            } else if (char === '#') {
                name = "m";
                option = bodies[0].substring(1);
            } else {
                name = bodies[0];
            }
        } else if (length === 2) {
            if (!isNaN(bodies[0])) {
                index = parseInt(bodies[0]);
                var char = bodies[1].charAt(0);
                if (char === '@') {
                    name = "p";
                    option = bodies[1].substring(1);
                } else if (char === '#') {
                    name = "m";
                    option = bodies[1].substring(1);
                } else {
                    name = bodies[1];
                }
            } else {
                name = bodies[0];
                option = bodies[1];
            }
        } else if (length >= 3) {
            index = parseInt(bodies[0]);
            name = bodies[1];
            option = bodies.slice(2).join(",");
        }
        var formatter = MAP[name];
        if (formatter == null) {
            console.log("Unknown formatter: " + name + ". Argument will not format but convert to string.");
            return (args.length) ? args[index] : null;
        }
        return formatter.call(this, option, (args.length) ? args[index] : null, bodies.length > 3 ? bodies.slice(3) : null);
    }

    Message.prototype.eval = Message.prototype.format2 = function (content, argument) {
        if (!content.length) return EMPTY;
        var $ = argument;   // define var to use by eval function.
        var option = {start: 0};
        while (true) {
            var body = getBody(content, option);
            if (body === null) return content;
            if (body === END) {
                return content.replaceAt(option.start, option.end + CL, EMPTY);
            }
            var value = eval(body) || "";
            content = content.replaceAt(option.start, option.end + CL, value);
            option.start += OL;
        }
    };

    function getBody(message, option) {
        var start = option.start || 0;
        var end;
        while (true) {
            start = message.indexOf(OPEN, start);
            if (start === -1) {
                return null;
            }
            if (start > 0 && message.charAt(start - 1) === '\\') {
                start += OL;
                continue;
            }
            break;
        }
        end = start;
        while (true) {
            end = message.indexOf(CLOSE, end);
            if (end > 0 && message.charAt(end - 1) === '\\') {
                end += CL;
                continue;
            }
            if (end === -1) {
                throw new Error("Invalid message format: no close tag found, in message:" + message + ", begin: " + start);
            }
            break;
        }
        option.start = start;
        option.end = end;
        return message.substring(start + OL, end);
    }


    function isEmpty(content) {
        return !content || content.trim().length === 0;
    }

    /**
     * Cut out array from source by index start.
     * @param source array or arguments.
     * @param start start index
     * @returns {Array} new array.
     */
    function cutout(source, start) {
        var count = source.length - start;
        var copy = [];
        for (var i = 0; i < count; i++) {
            copy[i] = source[start + i];
        }
        return copy;
    }

    //==================================================================================================================
    // format functions
    //------------------------------------------------------------------------------------------------------------------
    (function () {

        MAP[""] = function (option, argument) {

            return String.valueBy(argument);
        }

        /**
         * Call 'format(option)' function to format argument. If function not exists, then return them self(argument).
         * @param option format function parameter
         * @param argument format function owner
         * @returns {Object|String}
         */
        MAP["f-"] = function (option, argument) {
            if (argument === null) {
                return "null";
            }
            if (argument.format instanceof Function) {
                return argument.format(option);
            }
            return argument;
        }

        /**
         * Argument is function, and option will send that function.
         * @param option
         * @param argument
         * @returns {*}
         */
        MAP["f"] = function (option, argument) {
            if (argument instanceof Function) {
                return argument.apply(this, [option]);
            }
            return "null";
        }

        /**
         * Option is function, and argument will send that function.
         * @param option
         * @param argument
         * @returns {*}
         */
        MAP["f+"] = function (option, argument) {
            if (!option) return "null";
            var fn = eval(option);
            if (fn instanceof Function) {
                return fn.apply(this, [argument]);
            }
            return "null";
        }

        /**
         * Get argument's property then use specify formatter to format it.
         * @param option Contains formatter, parameters split by '/'
         * @param argument An object.
         * @returns {String}
         */
        MAP["f#"] = function (option, argument) {
            var options = option.split("/");
            var property = options[0];
            var value = MAP["p"](property, argument);
            var fn = MAP[options[1]];
            if (!fn) throw new Error("Unknown formatter: " + options[0]);
            return fn.call(this, options.length >= 2 ? options[2] : null, value);
        }

        //------------------------------------------------------------------------------------------------------------------
        /**
         * Get argument's property.
         *
         * @param option property name, like proA.proB.praC
         * @param argument property owner.
         * @returns {Object|String}
         */
        MAP["p"] = function (option, argument) {
            return from(option, argument);

            function from(name, owner) {
                if (owner == null) {
                    return "null";
                }
                var dot;
                while (true) {
                    dot = name.indexOf(".");
                    if (dot == -1) {
                        return owner[name];
                    }
                    var prop = name.substring(0, dot);
                    var value = owner[prop];
                    return from(name.substring(dot + 1), value);
                }
            }
        }

        //------------------------------------------------------------------------------------------------------------------
        /**
         * Call argument's function.
         * @param option method-name link. The name cannot contains '()', and method has one parameter that is option.
         * @param argument function owner.
         * @returns {Object|String}
         */
        MAP["m"] = function (option, argument) {
            return from(option, argument);

            function from(name, owner) {
                if (owner == null) {
                    return "null";
                }
                var dot, value;
                while (true) {
                    dot = name.indexOf(".");
                    if (dot === -1) {
                        value = eval(owner[name]);
                        if (value instanceof Function) {
                            return value.call(this, option);
                        }
                        return value;
                    }
                    value = eval(owner[name.substring(0, dot)]);
                    if (value instanceof Function) {
                        value = value.call(this);
                    }
                    return from(name.substring(dot + 1), value);
                }
            }
        }


        Message.prototype.array2s = function (option, argument) {
            if (!(argument instanceof Array) || argument.length === 0) {
                return EMPTY;
            }
            var format = def, field = null;
            if (option) {
                if (option.charAt(0) === '@') {
                    field = option.substring(1);
                } else {
                    format = eval(option);
                }
            }
            var buf = "";
            var size = argument.length;
            for (var i = 0; i < size; i++) {
                buf += format(argument[i], i, size, field);
            }

            function def(e, i, size, field) {
                var ret = e == null ? EMPTY : field ? e[field] : e;
                if (ret == null) return EMPTY;
                if (ret.toString().trim() === EMPTY) return EMPTY;
                return i > 0 ? ", " + ret : ret;
            }

            return buf;
        };
        MAP["[]"] = Message.prototype.a2s = Message.prototype.array2s;

        MAP["e"] = function (option, argument) {
            if (isEmpty(option)) return null;
            var $ = argument;
            return eval(replace(option));
        }

        /**
         * Convert a value to an other value.
         * The option is an array or a map.
         * If option is array, so argument must be index;
         * If option is map, so argument must be key, then return option[argument];
         * Option accept their name, call <code>eval(option)</code> to get them.
         * @param option Array or map.
         * @param argument Index or key.
         * @returns {*}
         */
        Message.prototype.convert = function (option, argument) {
            if (!option) return argument;
            if (typeof(argument) === "boolean") {
                argument = argument ? 1 : 0;
            }
            var M = String.isString(option) ? eval(option) : option;
            if (M instanceof Array) {
                var index = parseInt(argument);
                if (isNaN(index)) index = 0;
                return index >= 0 && index < M.length ? M[index] : "Index out of range: " + index;
            }
            return M[argument];
        }

        MAP["c"] = Message.prototype.c = Message.prototype.convert;

    })();


    //==================================================================================================================
    // Level content
    //------------------------------------------------------------------------------------------------------------------
    (function () {
        /**
         * Root class.
         *
         * @constructor
         */
        function Level() {
        }

        Level.prototype.link = function (value, flag) {
        };
        Level.prototype.getNext = function () {
        };
        Level.prototype.format = function (context) {
        };

        Level.prototype.init = function (context) {
            return this;
        };

        Level.find = function (start, option) {
            var next = start;
            while (next) {
                if (option.contains(next.flag)) return next;
                next = next.getNext();
            }
            return null;
        };

        Level.diff = function (start, end) {
            var next = start, level = 0;
            while (next) {
                if (next === end) break;
                next = next.getNext();
                level++;
            }
            return level;
        };

        /**
         * Proxy level, use proxy function to format.
         * Subclass still can override format function.
         * @param value
         * @param flag
         * @param unit
         * @param initializer A init proxy function to init before format. This function must return a Level object.
         * @param formatter A format proxy function to real do format work.
         * @param next This next Level object.
         * @constructor
         */
        function ProxyLevel(value, flag, unit, initializer, formatter, next) {
            Level.call(this);
            this.value = value;
            this.flag = flag;
            this.unit = unit || flag;
            this.initializer = initializer;
            this.formatter = formatter;
            this.next = next;
        }

        extend(Level, ProxyLevel);

        ProxyLevel.prototype.getNext = function () {
            return this.next;
        };

        ProxyLevel.prototype.getUnit = function () {
            return this.unit;
        };

        ProxyLevel.prototype.link = function (value, flag, unit, initializer, formatter) {
            return new ProxyLevel(value, flag, unit, initializer || this.initializer, formatter || this.formatter, this);
        };

        ProxyLevel.prototype.init = function (context) {
            if (this.initializer) {
                return this.initializer.call(this, context);
            }
            return this;
        };

        ProxyLevel.prototype.format = function (context) {
            if (this.formatter) {
                return this.formatter.call(this, context);
            }
            return null;
        };

        //-----------------------------------------------------------------------------------------------
        // Proxy functions
        //-----------------------------------------------------------------------------------------------
        function default_init(context) {
            if (String.isEmpty(context.option)) return this;
            var target = Level.find(this, context.option);
            context.target = target;
            return target ? target : this;
        };

        function range_init(context) {
            var option = context.option;
            context.old = option;
            context.option = "";
            context.level = 3;
            var pattern = /(\d+)|(\d+:\w+)|(\w+-\w+)/g
            if (!pattern.test(option)) return this;

            var exec = (/\w+-\w+/g).exec(option);
            if (exec) {
                var content = exec[0].split("-");
                var start = Level.find(this, content[0]);
                var end = Level.find(start, content[1]);
                context.level = Level.diff(start, end) + 1;
                context.start = start;
                return start
            }
            exec = (/\d+:\w+/g).exec(option);
            if (exec) {
                var content = exec[0].split(":");
                var start = Level.find(this, content[1]);
                context.level = parseInt(content[0]);
                context.start = start;
                return start;
            }
            exec = (/\d+/).exec(option);
            if (exec) {
                context.level = parseInt(exec[0]);
            }
            return this;
        };

        function link_format(context) {
            var div = context.number / this.value;
            var pos = context.option.indexOf(this.flag);
            if (pos !== -1) {
                var buf = message.sprintf("%0" + this.flag.length + "d", div);
                context.option = context.option.replaceAt(pos, pos + this.flag.length, buf);
                context.number %= this.value;
            }
            return true;
        };

        function simple_format(context) {
            var number = context.number;
            var option = context.option;
            var ret = 1.0 * number / this.value;
            var pos = option.indexOf(this.flag);
            if ((context.target === this) || (ret >= 1) || (!this.getNext())) {
                if (String.isEmpty(option)) {
                    option = "%.1f(" + (this.unit) + ")";
                } else if (pos === -1) {
                    option += "(" + (this.unit) + ")";
                } else {
                    option = option.replaceAt(pos, pos + this.flag.length, EMPTY);
                }
                context.option = message.sprintf(option, ret);
                return false;
            }
            return true;
        }

        function range_format(context) {
            var number = context.number;
            var ret = number / this.value;
            context.number = number % this.value;
            if (!context.mark && (context.start === this || (!context.start && ret > 1))) {
                context.mark = true;
            }
            if (context.mark) {
                var unit = this.getUnit(context.old);
                context.option += (message.sprintf("%d", ret) + unit);
                return !(!this.next || context.level-- <= 1);
            }
            return true;
        };


        //--------------------------------------------------------
        //@formatter:off
        var MILLISECOND    = 1;
        var SECOND         = MILLISECOND * 1000;
        var MINUTE         = SECOND * 60;
        var HOUR           = MINUTE * 60;
        var DAY            = HOUR * 24;
        var MONTH          = DAY * 30;
        var YEAR           = Math.floor(DAY * 365 + 5 * HOUR + 48 * MINUTE + 45.9747 * SECOND);
        var CENTURY        = YEAR * 100;


        var linkTime = new ProxyLevel(MILLISECOND, "SSS", null, default_init, link_format)
            .link(SECOND,   "ss")
            .link(MINUTE,   "mm")
            .link(HOUR,     "HH")
            .link(DAY,      "dd")
            .link(MONTH,    "MM")
            .link(YEAR,     "yyyy")
            .link(CENTURY,  "CN");


        var simpleTime = new ProxyLevel(MILLISECOND, "SSS", "毫秒",default_init,simple_format)
            .link(SECOND,   "ss",   "秒")
            .link(MINUTE,   "mm",   "分")
            .link(HOUR,     "HH",   "时")
            .link(DAY,      "dd",   "日")
            .link(MONTH,    "MM",   "月")
            .link(YEAR,     "yyyy", "年")
            .link(CENTURY,  "CN",   "世纪");

         var rangeTime = new ProxyLevel(MILLISECOND, "SSS", "毫秒",range_init,range_format)
            .link(SECOND,   "ss",   "秒")
            .link(MINUTE,   "mm",   "分")
            .link(HOUR,     "HH",   "时")
            .link(DAY,      "dd",   "天")
            .link(MONTH,    "MM",   "月")
            .link(YEAR,     "yyyy", "年")
            .link(CENTURY,  "CN",   "世纪");

        var B  = 1;
        var KB = KB * 1024;
        var MB = KB * 1024;
        var GB = MB * 1024;
        var TB = GB * 1024;
        var PB = TB * 1024;
        var ZB = PB * 1024;
        var EB = ZB * 1024;
        var YB = EB * 1024;
        var BB = YB * 1024;

         var linkSize = new ProxyLevel(B, "B",null,default_init,link_format)
            .link(KB, "KB")
            .link(MB, "MB")
            .link(GB, "GB")
            .link(TB, "TB")
            .link(PB, "PB")
            .link(ZB, "ZB")
            .link(EB, "EB")
            .link(YB, "YB")
            .link(BB, "BB");


          var simpleSize = new ProxyLevel(B, "B",null,default_init,simple_format)
            .link(KB, "KB")
            .link(MB, "MB")
            .link(GB, "GB")
            .link(TB, "TB")
            .link(PB, "PB")
            .link(ZB, "ZB")
            .link(EB, "EB")
            .link(YB, "YB")
            .link(BB, "BB");

        function formatter(level, def) {
            return function (option, number) {
                var context = {number: Number(number), option: option || def || ""};
                var next = level.init(context);
                while (next) {
                    if (!next.format(context)) break;
                    next = next.getNext();
                }
                return context.option;
            };
        }

        MAP["t"]    = Message.prototype.t   = Message.prototype.time        = formatter(linkTime, "HH:mm:ss");
        MAP["ts"]   = Message.prototype.ts  = Message.prototype.timeSimple  = formatter(simpleTime);
        MAP["tr"]   = Message.prototype.tr  = Message.prototype.timeRange   = formatter(rangeTime);
        MAP["sl"]   = Message.prototype.sl  = Message.prototype.sizeLink    = formatter(linkSize);
        MAP["s"]    = Message.prototype.s   = Message.prototype.size        = formatter(simpleSize);
        //@formatter:on
    })();

    //==================================================================================================================
    // date format content
    //------------------------------------------------------------------------------------------------------------------
    (function () {

        var week = ['日', '一', '二', '三', '四', '五', '六'];

        /**
         * Format date like Java date format.
         * @param option format pattern
         * @param argument date object[Must]. If this is null, then use current date.
         * @returns {String}
         */
        Message.prototype.date = function (_fmt, _date) {
            //These code not write by me, I copy from internet.
            if (arguments.length === 1) {
                _fmt = null;
                _date = arguments[0];
            }
            var fmt = _fmt || 'yyyy-MM-dd HH:mm:ss';
            var date = _date instanceof Date ? _date : new Date(_date || null);
            var obj = {
                'y': date.getFullYear(),                                    // 年份，注意必须用getFullYear
                'M': date.getMonth() + 1,                                   // 月份，注意是从0-11
                'd': date.getDate(),                                        // 日期
                'q': Math.floor((date.getMonth() + 3) / 3),                 // 季度
                'w': date.getDay(),                                         // 星期，注意是0-6
                'H': date.getHours(),                                       // 24小时制
                'h': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,// 12小时制
                'm': date.getMinutes(),                                     // 分钟
                's': date.getSeconds(),                                     // 秒
                'S': date.getMilliseconds()                                 // 毫秒
            };
            for (var i in obj) {
                fmt = fmt.replace(new RegExp(i + '+', 'g'), function (m) {
                    var val = obj[i] + '';
                    if (i === 'w') return (m.length > 2 ? '星期' : '周') + week[val];
                    for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val;
                    return m.length === 1 ? val : val.substring(val.length - m.length);
                });
            }
            return fmt;
        }

        MAP["d"] = Message.prototype.d = Message.prototype.date;
    })();

    //==================================================================================================================
    //Number format content
    //------------------------------------------------------------------------------------------------------------------

    (function () {

        var reCat = /[0#,.]+/gi;

        /**
         * To format number with pattern like '#,###.##00'.
         * <pre>
         *     Eg:
         *     Number   Pattern    Result
         *     12345    #.##    -> 12345
         *     12345    #.00    -> 12345.00
         *     12345    #,#     -> 12,345
         *     123      00000   -> 00123
         *     123.456  #.##    -> 123.45
         *     123.456  #.00    -> 123.45
         *     123.4    #.##    -> 123.4
         *     123.4    #.00    -> 123.40
         * </pre>
         * @param option format pattern
         * @param argument the number
         * @returns {string}
         */
        function formatter(option, argument) {
            //These code not write by my hand, I copy from internet, but make a little change.
            return doformat(option, argument == null ? 0 : argument);

            function doformat(option, num) {
                // var opt = {pattern: option ? option : "#"};
                // var zeroExc = opt.zeroExc == undefined ? true : opt.zeroExc;
                // var pattern = opt.pattern.match(reCat)[0];
                // var numChar = num.toString();
                // return !(zeroExc && numChar == 0) ? opt.pattern.replace(pattern, _formatNumber(numChar, pattern)) : opt.pattern.replace(pattern, "0");
                var pattern = option.match(reCat)[0];
                var numChar = num.toString();
                return option.replace(pattern, _formatNumber(numChar, pattern));
            }

            function _format(pattern, num, z) {
                var j = pattern.length >= num.length ? pattern.length : num.length;
                var p = pattern.split("");
                var n = num.split("");
                var bool = true, nn = "";
                for (var i = 0; i < j; i++) {
                    var x = n[n.length - j + i];
                    var y = p[p.length - j + i];
                    if (z == 0) {
                        if (bool) {
                            if ((x && y && (x != "0" || y == "0")) || (x && x != "0" && !y) || (y && y == "0" && !x)) {
                                nn += x ? x : "0";
                                bool = false;
                            }
                        } else {
                            nn += x ? x : "0";
                        }
                    } else {
                        if (y && (y == "0" || (y == "#" && x)))
                            nn += x ? x : "0";
                    }
                }
                return nn;
            }

            function _formatNumber(numChar, pattern) {
                var patterns = pattern.split(".");
                var numChars = numChar.split(".");
                var z = patterns[0].indexOf(",") == -1 ? -1 : patterns[0].length - patterns[0].indexOf(",");
                var num1 = _format(patterns[0].replace(","), numChars[0], 0);
                var num2 = _format(patterns[1] ? patterns[1].split('').reverse().join('') : "", numChars[1] ? numChars[1].split('').reverse().join('') : "", 1);
                num1 = num1.split("").reverse().join('');
                var reCat = eval("/[0-9]{" + (z - 1) + "," + (z - 1) + "}/gi");
                var arrdata = z > -1 ? num1.match(reCat) : undefined;
                if (arrdata && arrdata.length > 0) {
                    var w = num1.replace(arrdata.join(''), '');
                    num1 = arrdata.join(',') + (w == "" ? "" : ",") + w;
                }
                num1 = num1.split("").reverse().join("");
                return (num1 == "" ? "0" : num1) + (num2 != "" ? "." + num2.split("").reverse().join('') : "");
            }
        }

        MAP["n"] = Message.prototype.n = Message.prototype.number = formatter;
    })();


    //==================================================================================================================
    // sprintf content
    //------------------------------------------------------------------------------------------------------------------
    (function () {
        function int(number_string) {
            return Math.floor(Number(number_string));
        }

        var sprintfWrapper = {

            init: function () {

                if (typeof arguments === "undefined") {
                    return null;
                }
                if (arguments.length < 1) {
                    return null;
                }
                if (typeof arguments[0] !== "string") {
                    return null;
                }
                if (typeof RegExp === "undefined") {
                    return null;
                }

                var string = arguments[0];
                var exp = new RegExp(/(%([%]|(\\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
                var matches = new Array();
                var strings = new Array();
                var convCount = 0;
                var stringPosStart = 0;
                var stringPosEnd = 0;
                var matchPosEnd = 0;
                var newString = '';
                var match = null;

                while (match = exp.exec(string)) {
                    if (match[9]) {
                        convCount += 1;
                    }

                    stringPosStart = matchPosEnd;
                    stringPosEnd = exp.lastIndex - match[0].length;
                    strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

                    matchPosEnd = exp.lastIndex;
                    matches[matches.length] = {
                        match: match[0],
                        left: match[3] ? true : false,
                        sign: match[4] || '',
                        pad: match[5] || ' ',
                        min: match[6] || 0,
                        precision: match[8],
                        code: match[9] || '%',
                        negative: parseInt(arguments[convCount]) < 0 ? true : false,
                        argument: String(arguments[convCount])
                    };
                }
                strings[strings.length] = string.substring(matchPosEnd);

                if (matches.length == 0) {
                    return string;
                }
                if ((arguments.length - 1) < convCount) {
                    return null;
                }

                var code = null;
                var i = null;
                var substitution;
                for (i = 0; i < matches.length; i++) {

                    if (matches[i].code === '%') {
                        substitution = '%'
                    }
                    else if (matches[i].code === 'b') {
                        // matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
                        matches[i].argument = String(Math.abs(int(matches[i].argument)).toString(2));
                        substitution = sprintfWrapper.convert(matches[i], true);
                    }
                    else if (matches[i].code === 'c') {
                        // matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
                        matches[i].argument = String(String.fromCharCode(Math.abs(int(matches[i].argument))));
                        substitution = sprintfWrapper.convert(matches[i], true);
                    }
                    else if (matches[i].code === 'd') {
                        // matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
                        matches[i].argument = String(Math.abs(int(matches[i].argument)));
                        substitution = sprintfWrapper.convert(matches[i]);
                    }
                    else if (matches[i].code === 'f') {
                        // matches[i].argument = String(Math.abs(Number(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
                        matches[i].argument = String(Math.abs(Number(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
                        substitution = sprintfWrapper.convert(matches[i]);
                    }
                    else if (matches[i].code === 'o') {
                        // matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
                        matches[i].argument = String(Math.abs(int(matches[i].argument)).toString(8));
                        substitution = sprintfWrapper.convert(matches[i]);
                    }
                    else if (matches[i].code === 's') {
                        matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
                        substitution = sprintfWrapper.convert(matches[i], true);
                    }
                    else if (matches[i].code === 'x') {
                        // matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                        matches[i].argument = String(Math.abs(int(matches[i].argument)).toString(16));
                        substitution = sprintfWrapper.convert(matches[i]);
                    }
                    else if (matches[i].code === 'X') {
                        // matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                        matches[i].argument = String(Math.abs(int(matches[i].argument)).toString(16));
                        substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
                    }
                    else {
                        substitution = matches[i].match;
                    }

                    newString += strings[i];
                    newString += substitution;

                }
                newString += strings[i];

                return newString;

            },

            convert: function (match, nosign) {
                if (nosign) {
                    match.sign = '';
                } else {
                    match.sign = match.negative ? '-' : match.sign;
                }
                var l = match.min - match.argument.length + 1 - match.sign.length;
                var pad = new Array(l < 0 ? 0 : l).join(match.pad);
                if (!match.left) {
                    if (match.pad === "0" || nosign) {
                        return match.sign + pad + match.argument;
                    } else {
                        return pad + match.sign + match.argument;
                    }
                } else {
                    if (match.pad === "0" || nosign) {
                        return match.sign + match.argument + pad.replace(/0/g, ' ');
                    } else {
                        return match.sign + match.argument + pad;
                    }
                }
            }
        };

        MAP["sf"] = Message.prototype.sf = Message.prototype.sprintf = sprintfWrapper.init;
    })();

    window.$$ = window.message = new Message();

    defineProperty(String.prototype, "format", {
        value: function () {
            return message.format.apply(message, [this].append(arguments));
        }
    });

    defineProperty(String.prototype, "eval", {
        value: function () {
            return message.eval.apply(message, [this].append(arguments));
        }
    });


})(window, undefined);
