"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(amount, interest_rate) {
    let arr = [];
    let tempAmount = amount;
    while (arr.length <= 12) {
        tempAmount += tempAmount * interest_rate;
        arr.push(tempAmount);
    }
    return arr;
}
exports.default = default_1;
//# sourceMappingURL=calAccrued.js.map