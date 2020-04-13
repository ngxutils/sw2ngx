"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnumTemplate = /** @class */ (function () {
    function EnumTemplate() {
    }
    EnumTemplate.prototype.body = function (value) {
        var temp = [];
        for (var _i = 0, _a = value.value; _i < _a.length; _i++) {
            var param = _a[_i];
            temp.push(param.key + "= " + (parseInt(param.val.toString(), 10).toString() !== 'NaN' ? param.val : '"' + param.val + '"'));
        }
        return temp.join(',\r\n\t');
    };
    EnumTemplate.prototype.compile = function (value) {
        return "\nexport enum " + value.name + " {\n  " + this.body(value) + "\n}\n";
    };
    return EnumTemplate;
}());
exports.EnumTemplate = EnumTemplate;
//# sourceMappingURL=enum.js.map