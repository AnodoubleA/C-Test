/**
 * Extends system object or class.
 *
 * @version 1.2
 * @update 2018.01.23.
 *
 * Created by Alice on 2016.12.23.
 */

function defineProperty(object, name, option, override) {
	if (!(name in object) || override) {
		Object.defineProperty(object, name, option);
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Array extends
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * Test has specify item.
 */
defineProperty(Array.prototype, "has", {
	enumerable: false,
	value: function (item) {

		return this.indexOf(item) > -1;
	}
});


/**
 * Insert item by index.
 */
defineProperty(Array.prototype, "insert", {
	enumerable: false,
	value: function (index, item) {
		this.splice(index, 0, item);
		return this;
	}
});

/**
 * Remove an element form array by given index.
 */
defineProperty(Array.prototype, "remove", {
	enumerable: false,
	value: function (index) {
		if (isNaN(index) || index > this.length) {
			return this;
		}
		if (index > -1 && index < this.length) {
			this.splice(index, 1);
		}
		return this;
	}
});

/**
 * Remove an element from array by index.
 */
defineProperty(Array.prototype, "delete", {
		enumerable: false,
		value: function (val, from) {
			var index = this.indexOf(val, from);
			if (index >= 0) {
				this.remove(index);
			}
			return this;
		}
	}
);

/**
 * Clean all element from array.
 */
defineProperty(Array.prototype, "clear", {
		enumerable: false,
		value: function () {
			this.splice(0, this.length);
			return this;
		}
	}
);

defineProperty(Array.prototype, "find", {
		enumerable: false,
		value: function (filter) {
			for (var i = this.length - 1; i >= 0; i--) {
				if (filter(this[i])) {
					return this[i];
				}
			}
			return null;
		}
	}
);

/**
 * Append items in array.
 */
defineProperty(Array.prototype, "append", {
		enumerable: false,
		value: function (items, clean) {
			if (clean === true) this.clear();

			var size = (items && items.length) || 0;
			if (size === 0) return;

			for (var i = 0; i < size; i++) {
				this.push(items[i]);
			}
			return this;
		}
	}
);
/**
 * Clean old data and append new data.
 */
defineProperty(Array.prototype, "seize", {
		enumerable: false,
		value: function (items) {
			this.clear();
			return this.append(items);
		}
	}
);


/**
 * Get new an array from given key.
 *
 * The key can be those value.
 * <ul>
 *     <li>A String: as object property, like this: 'address.city'</li>
 *     <li>A Array: get from array and array, like this: [0,1]</li>
 *     <li>A Function: you decide what to collect. callback argument: current value,index,this array.</li>
 *     <li>A Integer: get all data in this list at index</li>
 * </ul>
 *
 *  If you has any question, see this implement.
 *
 * @param The given key.
 */
defineProperty(Array.prototype, "collect", {
		enumerable: false,
		value: function (key) {
			var ret = [];
			var size = this.length;
			if (!isNaN(key)) {
				for (var i = 0; i < size; i++) {
					ret[i] = this[i][key];
				}
				return ret;
			}
			if (String.isString(key)) {
				for (var i = 0; i < size; i++) {
					ret[i] = Object.val(this[i], key);
				}
				return ret;
			}
			if (Array.isArray(key)) {
				var len = key.length;
				for (var i = 0; i < size; i++) {
					var owner = this[i];
					for (var j = 0; j < len; j++) {
						owner = owner[key[j]];
					}
					ret[i] = owner;
				}
				return ret;
			}
			throw new Error("Un-support key: " + key);
		}
	}
);

defineProperty(Array.prototype, "fill", {
		enumerable: false,
		value: function (val) {
			for (var i = this.length - 1; i >= 0; i--) {
				this[i] = val;
			}
			return this;
		}
	}
);
defineProperty(Array.prototype, "clone", {
		enumerable: false,
		value: function () {
			var copy = new Array(this.length);
			for (var i = this.length - 1; i >= 0; i--) {
				copy[i] = (this[i] && this[i].clone) ? this[i].clone() : this[i];
			}
			return copy;
		}
	}
);

defineProperty(Array.prototype, "isEmpty", {
		enumerable: false,
		get: function () {
			return this.length === 0;
		}
	}
);

defineProperty(Array.prototype, "notEmpty", {
		enumerable: false,
		get: function () {
			return this.length > 0;
		}
	}
);


/**
 * Make an new array from given condition.
 *
 * The argument 'start' and argument end has second means.
 *
 * If 'end' &lt; 0, then start is fill value and end is new array size.
 * Else, return a sequence array start by 'start' and end by 'end'(exclusive).
 *
 * @params start The start value
 */
defineProperty(Array, "make", {
		enumerable: false,
		value: function (start, end) {
			if (end < 0) {
				return new Array(-end).fill(start);
			}

			var ret = [];
			for (var i = start; i < end; i++) {
				ret.push(i);
			}
			return ret;
		}
	}
);

/**
 * Group a list to map by given key.
 *
 */
defineProperty(Array.prototype, "group", {
		enumerable: false,
		value: function (key) {
			var map = new Map();
			this.forEach(function (e) {
				var value = e[key];
				if (!map.has(value)) {
					map.set(value, []);
				}
				map.get(value).push(e);
			});
			return map;
		}
	}
);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// String extends
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * Delete (count) string from some index.
 * @params start start index.
 * @params len delete count.
 */
defineProperty(String.prototype, "delete", {
		value: function (start, len) {
			return this.substring(0, start) + this.substring(start + len, this.length);
		}
	}
);
/**
 * Delete string by index between start and end.
 * @params start The beginning index, inclusive.
 * @params end The ending index, exclusive.
 */
defineProperty(String.prototype, "deleteAt", {
		value: function (start, end) {
			return this.substring(0, start) + this.substring(end, this.length);
		}
	}
);

/**
 * Replace string to new content at index between start and end.
 *
 * @params start The beginning index, inclusive.
 * @params end The ending index, exclusive.
 * @params str   String that will replace contents.
 */
defineProperty(String.prototype, "replaceAt", {
		value: function (start, end, content) {
			return this.substring(0, start) + content + this.substring(end, this.length);
		}
	}
);

/**
 * Replace start to new content at index to length.
 *
 * @params start The beginning index inclusive.
 * @params length The length to replace.
 * @params content The new content for replace.
 */
defineProperty(String.prototype, "replaceBy", {
		value: function (start, length, content) {
			return this.replaceAt(start, start + length, content);
		}
	}
);
defineProperty(String.prototype, "insert", {
		value: function (index, value) {
			if (index > this.length) {
				return this.concat(value);
			}
			return this.replace(new RegExp("(.{" + index + "})"), "$1" + value);
		}
	}
);


defineProperty(String.prototype, "contains", {
		value: function (content, from) {
			return this.indexOf(content, from) !== -1;
		}
	}
);

defineProperty(String, "isString", {
		value: function (value) {
			return (typeof value === "string") || (value instanceof String);
		}
	}
);

defineProperty(String, "isEmpty", {
		value: function (value) {
			return (value === null || value === undefined || value.length === 0);
		}
	}
);

defineProperty(String, "isBlank", {
		value: function (value) {
			return (this.isEmpty(value) || value.match(/^\s*$/));
		}
	}
);
defineProperty(String, "trim", {
		value: function (value) {

			return String.isString(value) ? value.trim() : value;
		}
	}
);


/**
 * Return a string.
 * If value is null return def or 'null';
 * If value is undefined return def or 'undefined';
 * Else return value.toString();
 */
defineProperty(String, "valueBy", {
		value: function (value, def) {
			if (value === null) {
				return def || "null";
			}
			if (value === undefined) {
				return def || "undefined";
			}
			return value.toString();
		}
	}
);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Boolean extends
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * Extends a method that name's boolOf(value,default).
 * Except two parameter. Fist is string and second is bool.
 * If first parameter is [undefined | null | ''], then return second parameter(default value).
 * If fist parameter is 'TRUE' or 'true', then return true. Else return false.
 */
defineProperty(Boolean, "boolOf", {
		value: function (value, def) {
			if (!value || value.trim() === '') {
				return def;
			}
			return value.toLowerCase() === "true";
		}
	}
);

/**
 * Get/Set a value form/to an object.
 *
 * Function has three parameters, witch is
 * <ul>
 * <li>object: the get/set subject.</li>
 * <li>field: property name, like 'address' or 'address.city'</li>
 * <li>value: only use in set operation.</li>
 * </ul>
 * If no value parameter, then get object's property value. Else set it.
 */
defineProperty(Object, "val", {
		value: function (object, field, value) {
			if (arguments.length === 2) {
				return get();
			}
			set();

			function get() {
				if (object == null) return null;

				var start = 0, end;
				var owner = object;
				while (true) {
					end = field.indexOf(".", start);
					if (end < 0) {
						return start === 0 ? owner[field] : owner[field.substring(start)];
					}
					var name = field.substring(start, end);
					owner = owner[name];
					if (owner == null) return null;
					start = end + 1;
				}
			}

			function set() {
				if (object == null) return;

				var start = 0, end;
				var owner = object;
				while (true) {
					end = field.indexOf(".", start);
					if (end < 0) {
						owner[start === 0 ? field : field.substring(start)] = value;
						break;
					}
					var name = field.substring(start, end);
					var get = owner[name];
					owner = (get == null) ? (owner[name] = {}) : get;
					start = end + 1;
				}
			}
		}
	}
);

defineProperty(Object, "empty", {
		value: function (target) {
			for (var key in target) {
				delete target[key];
			}
		}
	}
);

//======================================================================================================================
// For extends object.
/**
 *
 * @param Super Super class
 * @param Class Sub class
 */
function extend(Super, Class) {
	function F() {
	};
	F.prototype = Super.prototype;
	var prototype = new F();
	prototype.constructor = Class;
	Class.prototype = prototype;
}

//======================================================================================================================

/**
 * If value not null, then return value, else return def.
 * @param value test value.
 * @param def default value.
 * @returns {*}
 */
function defaultValue(value, def) {

	return (value === null || value === undefined) ? def : value;
};

function defineIfUndefine(object, field, value) {
	if (object[field] === null || object[field] === undefined) {
		object[field] = value;
	}
}

/**
 * Eval as silent.
 * Any exception happened, return undefined.
 * @param content for eval.
 * @returns {*}
 */
function evals(content) {
	try {
		return eval(content);
	} catch (exception) {
		return undefined;
	}
}