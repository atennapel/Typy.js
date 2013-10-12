/* Typy.js
 * @author: Albert ten Napel
 * @version: 1.0
 *
 * Functions:
 * 	hasType(type, val) -> returns true if the val is of type else returns false
 * 	type(type, val) -> returns the val if the val is of type else throws TypeError
 * 	typed([type*], type, fn) or
 * 	typed([type*], fn) -> wrap the function such that all the input arguments and
 * 		the output value must hold the type constraints else throws error.
 * 	toString(type) -> returns a string representation of the type.
 *
 * Types:
 * 	true (*)-> any type
 * 	false (-) -> no type
 * 	number -> checks for equality with that number
 *
 * 	Number -> Number or number
 * 	Function -> Function or function
 * 	String -> String or string
 * 	Boolean -> Boolean or boolean
 * 	Object -> Object or object
 * 	Array -> Array
 *
 * 	any constructor -> instanceof check
 *
 * 	[Type*] -> tuple, checks if the object is an array with the same types in the same order
 * 	'property' (.property) -> checks if the object has the property
 *
 * 	Object type properties:
 * 		any: [Type*] -> checks if any of the types is true 
 * 		all: [Type*] -> all types must be true
 * 		forall: Type -> the object must be an non-empty array and contain only objects of Type
 * 		prop: prop or [prop], type: Type -> checks if the object has the propert(y|ies) and they all have Type
 * 		struct: {(prop: Type)*} -> checks if the object has the props with the types and only those props
 * 		pstruct: {(prop: Type)*} -> like struct but the object is allowed to have other properties 
 * 		val: Value -> checks for strict equality with Value
 */

var Typy = (function() {
	function hasType(t, o) {
		if(t === false) return false;
		if((t === true) ||
			(typeof t == 'string' && o[t] !== undefined) ||
			((typeof t == 'number' || t instanceof Number) && o === t) ||
			(t === Number && typeof o == 'number') ||
			(t === Array && Array.isArray(o)) ||
			(t === Function && typeof o == 'function') ||
			(t === String && typeof o == 'string') ||
			(t === Boolean && typeof o == 'boolean') ||
			(t === Object && typeof o == 'object') ||
			(typeof t == 'function' && o instanceof t)) return true;
		if(Array.isArray(t)) {
			if(!Array.isArray(o) || o.length != t.length) return false;
			for(var i = 0, l = t.length; i < l; i++)
				if(!hasType(t[i], o[i])) return false;
			return true;
		}
		if(typeof t == 'object') {
			if(t.any) {
				if(t.any.length == 0) return false;
				else for(var i = 0, l = t.any.length; i < l; i++) {
					if(hasType(t.any[i], o)) break;
				}
			}
			if(t.val) {
				if(t.val !== o) return false;
			}
			if(t.prop && t.type) {
				if(Array.isArray(t.prop)) {
					for(var i = 0, l = t.prop.length; i < l; i++)
						if(o[t.prop[i]] === undefined || !hasType(t.type, o[t.prop[i]]))
							return false;
				} else if(o[t.prop] === undefined || !hasType(t.type, o[t.prop]))
					return false;
			}
			if(t.all) {
				if(t.all.length != 0) for(var i = 0, l = t.all.length; i < l; i++) {
					if(!hasType(t.all[i], o)) return false;
				}
			}
			if(t.forall) {
				if(!Array.isArray(o) || o.length == 0) return false;
				for(var i = 0, l = o.length; i < l; i++) {
					if(!hasType(t.forall, o[i])) return false;
				}
			}
			if(t.struct) {
				var skeys = Object.keys(t.struct), okeys = Object.keys(o);
				if(skeys.length != okeys.length) return false;
				for(var i = 0, l = skeys.length; i < l; i++) {
					if(!hasType(t.struct[skeys[i]], o[skeys[i]])) return false;
				}
			}
			if(t.pstruct) {
				var skeys = Object.keys(t.pstruct);
				for(var i = 0, l = skeys.length; i < l; i++) {
					if(!hasType(t.pstruct[skeys[i]], o[skeys[i]])) return false;
				}
			}
			return true;
		}
		return false;
	};

	function type(t, o, c) {
		if(hasType(t, o)) return o;
		if(c) return c(t, o);
		throw new TypeError('TypeError: expected '+toString(t));
	};

	function typed(a, b, c) {
		return arguments.length == 2? function() {
			type(a, [].slice.call(arguments));
			return b.apply(this, arguments);
		}: function() {
			type(a, [].slice.call(arguments));
			return type(b, c.apply(this, arguments));
		};
	};

	function toString(t) {
		if(t === true) return '*';
		if(t === false) return '-';
		if(typeof t == 'string') return '.'+t;
		if(typeof t == 'number' || t instanceof Number) return ''+t;
		if(t === Number) return 'Number';
		if(t === Array) return 'Array';
		if(t === Function) return 'Function';
		if(t === String) return 'String';
		if(t === Boolean) return 'Boolean';
		if(t === Object) return 'Object';
		if(typeof t == 'function') return t.name;
		if(Array.isArray(t)) return '['+t.map(toString).join(', ')+']';
		if(typeof t == 'object') {
			var r = [];
			for(var k in t)
				if(t.hasOwnProperty(k))
					r.push(k+': '+toString(t[k]))
			return '{'+r.join(', ')+'}';
		}
	};
	
	return {
		hasType: hasType,
		type: type,
		typed: typed,
		toString: toString
	};
})();