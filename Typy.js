/* Typy.js
 * @author: Albert ten Napel
 * @version: 1.0
 *
 * Functions:
 * 	hasType(type, val) -> returns true if the val is of type else returns false
 * 	type(type, val) or type(type, val, callback) -> returns the val if the val is of type else call callback or throw TypeError
 * 	typed([type*], type, fn) or
 * 	typed([type*], fn) -> wrap the function such that all the input arguments and
 * 		the output value must hold the type constraints else throws error.
 * 	toString(type) -> returns a string representation of the type.
 * 	multi((Type, Fn)+) -> returns a multimethod.
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
 * 		type: Type -> checks if the type is true
 * 		any: [Type*] -> checks if any of the types is true 
 * 		all: [Type*] -> all types must be true
 * 		forall: Type -> the object must be an non-empty array and contain only objects of Type
 * 		propall: Type -> like forall but checks all the properties of an object
 * 		prop: prop or [prop], ptype: Type -> checks if the object has the propert(y|ies) and they all have Type
 * 		struct: {(prop: Type)*} -> checks if the object has the props with the types and only those props
 * 		pstruct: {(prop: Type)*} -> like struct but the object is allowed to have other properties 
 * 		not: Type -> checks if object is of any other type than Type
 * 		eq: Value -> checks for strict equality with Value
 * 		neq: Value -> checks for strict inequality with Value
 * 		gt: Value -> checks if the object is > Value
 * 		lt: Value -> checks if the object is < Value
 * 		gteq: Value -> checks if the object is >= Value
 * 		lteq: Value -> checks if the object is <= Value
 * 		concat: [Tuple, Type] -> checks if the object is an array of concats
 * 		pred: Function -> the object must pass the predicate function
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
			if(t.not && hasType(t.not, o)) return false;
			if(t.type && !hasType(t.type, o)) return false;

			if(t.eq && t.eq !== o) return false;
			if(t.neq && t.neq === o) return false;
			if(t.gt && !(o > t.gt)) return false;
			if(t.lt && !(o < t.lt)) return false;
			if(t.gteq && !(o >= t.gteq)) return false;
			if(t.lteq && !(o <= t.lteq)) return false;

			if(t.prop && t.ptype) {
				if(Array.isArray(t.prop)) {
					for(var i = 0, l = t.prop.length; i < l; i++)
						if(o[t.prop[i]] === undefined || !hasType(t.ptype, o[t.prop[i]]))
							return false;
				} else if(o[t.prop] === undefined || !hasType(t.ptype, o[t.prop]))
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
			if(t.propall) {
				var props = Object.keys(o);
				if(props.length == 0) return false;
				for(var i = 0, l = props.length; i < l; i++) {
					if(!hasType(t.propall, o[props[i]])) return false;
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
			if(t.concat) {
				if(!Array.isArray(o)) return false;
				var a1 = t.concat[0], a1l = a1.length;
				if(!hasType(a1, o.slice(0, a1l)) || !hasType(t.concat[1], o.slice(a1l))) return false;
			}
			if(t.pred && !t.pred(o)) return false;
			return true;
		}
		return false;
	};

	function type(t, o, c) {
		if(hasType(t, o)) return o;
		if(typeof c == 'function') return c(t, o);
		if(c) return c;
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

	var multi = function() {
		var inp = [].slice.call(arguments);
		var t = function() {
			for(var i = 0, l = inp.length; i < l; i += 2)
				if(hasType(inp[i], [].slice.call(arguments)))
					return inp[i+1].apply(this, arguments);
			throw new TypeError('TypeError: multimethod failed');
		}
		t.add = function() {
			inp.push.apply(inp, arguments);
			return t;
		}
		return t;
	};
	
	return {
		hasType: hasType,
		type: type,
		typed: typed,
		toString: toString,
		multi: multi
	};
})();
