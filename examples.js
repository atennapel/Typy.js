var Typy = require('./Typy');
var multi = Typy.multi;

// Multi method example
var eq = multi(
	{any: [
		[Number, Number],
		[String, String],
		[Boolean, Boolean]
	]}, function(a, b) {
		return a == b;
	},
	[Array, Array], function arrEq(a, b) {
		if(a.length != b.length) return false;
		if(a.length == 0) return true;

		for(var i=0,l=a.length;i<l;i++)
			if(!eq(a[i], b[i]))
				return false;
		return true;
	},
	[Object, Object], function arrEq(a, b) {
		var ak = Object.keys(a), bk = Object.keys(b);
		if(ak.length != bk.length) return false;
		if(ak.length == 0) return true;

		for(var i=0,l=ak.length;i<l;i++)
			if(!eq(a[ak[i]], b[ak[i]]))
				return false;
		return true;
	}
).fallback(false);

// add more cases later
var Person = function(name) {this.name = name};

eq.add([Person, Person], function(a, b) {
	return a.name == b.name;
});
