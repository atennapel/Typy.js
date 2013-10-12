Typy.js
=======

Type constraints for Javascript.

# Functions
**hasType(type, val)** -> returns true if the val is of type else returns false

**type(type, val)** -> returns the val if the val is of type else throws TypeError

**typed([type\*], type, fn) or
typed([type\*], fn)** -> wrap the function such that all the input arguments and
	the output value must hold the type constraints else throws error.

**toString(type)** -> returns a string representation of the type.
 
# Types
**true (\*)** -> any type

**false (-)** -> no type

**number** -> checks for equality with that number

 
**Number** -> Number or number

**Function** -> Function or function

**String** -> String or string

**Boolean** -> Boolean or boolean

**Object** -> Object or object

**Array** -> Array


**any constructor** -> instanceof check


**[Type\*]** -> tuple, checks if the object is an array with the same types in the same order

**'property' (.property)** -> checks if the object has the property


## Object type properties
**type: Type** -> checks if the type is true

**any: [Type\*]** -> checks if any of the types is true 

**all: [Type\*]** -> all types must be true

**forall: Type** -> the object must be an non-empty array and contain only objects of Type

**prop: prop or [prop], ptype: Type** -> checks if the object has the propert(y|ies) and they all have Type

**struct: {(prop: Type)\*}** -> checks if the object has the props with the types and only those props

**pstruct: {(prop: Type)\*}** -> like struct but the object is allowed to have other properties 

**not: Type** -> checks if object is of any other type than Type

**eq: Value** -> checks for strict equality with Value

**neq: Value** -> checks for strict inequality with Value

**gt: Value** -> checks if the object is > Value

**lt: Value** -> checks if the object is < Value

**gteq: Value** -> checks if the object is >= Value

**lteq: Value** -> checks if the object is <= Value

# Examples
```javascript
var hasType = Typy.hasType;
hasType(Number, 5); // true
hasType(String, '5'); // true
hasType(String, 5); // false
hasType([Number, String], [10, 'g']); // true
hasType([Number, String], [10, 5]); // false
hasType('a', {a: 5}); // true
hasType('a', {b: 5}); // false
hasType(10, 10); // true
hasType(10, '10'); // false
hasType(true, '10'); // true
hasType(false, '10'); // false
hasType({any: [Number, String]}, '10'); // true
hasType({any: [Number, String]}, 10); // true
hasType({forall: Number}, [1, 2, 3]); // true
hasType({all: [Number, Object]}, new Number(5)); // true
hasType({struct: {name: String, age: Number}}, {name: 'a', age: 10}); // true
hasType({pstruct: {name: String, age: Number}}, {name: 'a', age: 10, otherprop: 'a'}); // true
hasType({type: Number, gt: 10, lt: 20}, 15); // true
hasType({type: Number, gt: 10, lt: 20}, 25); // false

var typed = Typy.typed;
var add = typed([Number, Number], Number, function(a, b) {
	return a + b;
});

add(1, 2); // 3
add(1, '2'); // TypeError
add(1, 2, 3); // TypeError

var type = Typy.type;
type(Number, 5); // 5
type(Number, '5'); // TypeError
```
