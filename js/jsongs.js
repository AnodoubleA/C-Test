/**
 * Get json from dom elements or set json to dom elements.
 *
 * The field dom element must be contains 'field' attr. the field is json's field. Like 'person.address.city'.
 *
 * Choose:
 * <ul>
 * <li>
 *     field-type:
 *     case: 'radio' get/set a value from/to radio element array.
 *     case: 'checkbox' get/set values from/to checkbox element array.
 * </li>
 * <li>
 *     getter: function name or expression like: 'getText' or '{message.number('#.00',$)}'.
 *     If getter is function(just name, cannot contains space), then use it's return value. must not be return 'undefined', use first.
 *     Else is expression, use {@link Message.eval} to format it.
 *     You can change the format function, just set in <code>option.format</code>.

 *     The '$' is current value.
 *     eg: <input field='person.height' getter='{message.number('#.00',$)}'/>, $ is person.height.
 *     If person.height = 17.520, so '$' is 17.520.
 * </li>
 * <li>
 *     setter: function name or expression.
 *     See getter.
 * </li>
 *
 * <li>
 *     recursion: boolean, if 'true'(only) then process sub elements.
 * </li>
 *
 * <li>
 *     default: when set to element value is null or undefined, then use default value.
 * </li>
 *
 * </ul>
 *
 * @version 2.0
 * @update 2017-11-23
 *
 * @author Alice on 2017-11-22
 *
 * @param $ jQuery object.
 */
(function ($) {

	var options = {
		getter: "getter",
		setter: "setter",
		field: "field",
		fieldType: "field-type",
		recursion: "recursion",
		default: "default",
		fnExp: /^[A-Za-z0-9_$]+$/
	};

	var MAP = {
		input: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				return dom.val();
			},
			set: function (dom, json, option) {
				var ret = may_set(dom, json, option);
				if (ret === true) return;

				var exp = dom.attr(options.setter);
				var def = dom.attr(options.default);
				ret = exp ? option.format(exp, json) : json;
				dom.val(ret == null ? def : ret);
			}
		},
		textarea: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				return dom.val();
			},
			set: function (dom, value, option) {
				var ret = may_set(dom, value, option);
				if (ret === true) return;

				var exp = dom.attr(options.setter);
				var def = dom.attr(options.default);
				ret = exp ? option.format(exp, value) : value;
				dom.val(ret == null ? def : ret);
			}
		},

		radio: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				return dom.find(":checked").val();
			},
			set: function (dom, value, option) {
				var ret = may_set(dom, value, option);
				if (ret === true) return;

				dom.find("[value=" + value + "]").attr("checked", true);
			}
		},
		checkbox: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				var values = [];
				var box = dom.find(":checked");
				for (var i = 0; i < box.length; i++) {
					values[i] = $(box[i]).val();
				}
				return values;
			},
			set: function (dom, value, option) {
				var ret = may_set(dom, value, option);
				if (ret === true) return;

				var values = value instanceof Array ? value : [value];
				var nodes = dom.find("[type=checkbox]");
				for (var i = nodes.length - 1; i >= 0; i--) {
					var node = $(nodes[i]);
					node.attr("checked", values.find(function (item) {
						return String.valueBy(item) === node.val();
					}));
				}
			}
		},

		select: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				var nodes = dom.find(":selected");
				var size = nodes.length;
				if (size < 2) {
					return nodes.val();
				}
				var values = [];
				for (var i = 0; i < size; i++) {
					values[i] = $(nodes[i]).val();
				}
				return values;
			},
			set: function (dom, value, option) {
				var ret = may_set(dom, value, option);
				if (ret === true) return;

				if (value instanceof Array) {
					var size = value.length;
					for (var i = 0; i < size; i++) {
						dom.find("option[value=" + String.valueBy(value[i]) + "]").attr("selected", true);
					}
				} else {
					dom.find("option[value=" + String.valueBy(value) + "]").attr("selected", true);
				}
			}
		},
		default: {
			get: function (dom, option) {
				var ret = may_get(dom, option);
				if (ret !== undefined) {
					return ret;
				}
				return dom.text();

			},
			set: function (dom, value, option) {
				var ret = may_set(dom, ret, option);
				if (ret === true) return;

				var exp = dom.attr(options.setter);
				var def = dom.attr(options.default);
				ret = exp ? option.format(exp, value) : value;
				dom.text(ret == null ? def : ret);
			}
		}
	};

	function may_get(dom, value, option) {
		var get = dom.attr(options.getter);
		if (get === "@setter") {
			get = dom.attr(options.setter);
		}
		if (get) {
			try {
				if (!options.fnExp.test(get)) {
					return undefined;
				}
				get = eval(get);
				if (get) return get(dom, value, option);
			} catch (error) {
			}
		}
		return undefined;
	}

	function may_set(dom, value, option) {
		var set = dom.attr(options.setter);
		if (set === "@getter") {
			set = dom.attr(options.getter);
		}
		if (set) {
			try {
				if (!options.fnExp.test(set)) {
					return false;
				}
				set = eval(set);
				if (set) {
					set(dom, value, option);
					return true;
				}
			} catch (error) {
			}
		}
		return false;
	}

	function setValue(json, field, value) {
		try {
			Object.val(json, field, value);
		} catch (error) {
		}
	}

	function getValue(json, field) {
		try {
			return Object.val(json, field);
		} catch (error) {
		}
		return undefined;
	}

	function jsonget(e, json, option) {
		var nodes = $(e).children();
		var size = nodes.length;
		for (var i = 0; i < size; i++) {
			var node = $(nodes[i]);
			var field = node.attr(options.field);
			var type = node.attr(options.fieldType) || node[0].tagName.toLowerCase();
			var handle = MAP[type] || (field ? MAP.default : null);
			if (handle && field) {
				setValue(json, field, handle.get(node, option));
				if (Boolean.boolOf(node.attr(options.recursion)) !== true) {
					continue;
				}
			}
			if (node[0].children.length > 0) {
				jsonget(node, json, option);
			}
		}
		return json;
	}

	function jsonset(e, json, option) {
		var nodes = $(e).children();
		var size = nodes.length;
		for (var i = 0; i < size; i++) {
			var node = $(nodes[i]);
			var field = node.attr(options.field);
			var type = node.attr(options.fieldType) || node[0].tagName.toLowerCase();
			var handle = MAP[type] || (field ? MAP.default : null);
			if (handle && field) {
				handle.set(node, getValue(json, field), option);
				if (Boolean.boolOf(node.attr(options.recursion)) !== true) {
					continue;
				}
			}
			if (node[0].children.length > 0) {
				jsonset(node, json, option);
			}
		}
		return json;
	}

	$.fn.jsonget = function (json, option) {
		return jsonget(this, json || {}, option);
	}
	$.fn.jsonset = function (json, option) {
		option = option || {};
		option.format = option.format || message.eval;
		return jsonset(this, json || {}, option);
	}

})(jQuery);