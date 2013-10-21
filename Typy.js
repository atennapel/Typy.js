/* Typy.js
 * @author: Albert ten Napel
 * @version: 1.2
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
				else {
					var skip = false;
					for(var i = 0, l = t.any.length; i < l; i++)
						if(hasType(t.any[i], o)) {skip = true; break}
					if(!skip) return false;
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

	function multi() {
		var inp = [].slice.call(arguments);
		var fallBackV;
		var t = function() {
			for(var i = 0, l = inp.length; i < l; i += 2) {
				var a = inp[i], b = inp[i+1];
				if(a !== undefined && b !== undefined && hasType(a, [].slice.call(arguments))) {
					if(typeof b == 'function')
						return inp[i+1].apply(this, arguments);
					else return b;
				}
			}
			if(fallBackV !== undefined) {
				if(typeof fallBackV == 'function')
					return fallBackV.apply(this, arguments);
				else return fallBackV;
			}
			throw new TypeError('TypeError: multimethod failed');
		}
		t.add = function() {
			inp.push.apply(inp, arguments);
			return t;
		};
		t.fallback = function(v) {fallBackV = v; return t};
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

if(typeof module !== 'undefined' && module.exports) module.exports = Typy;
