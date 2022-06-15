"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(amount, interest_rate) {
    let arr = [];
    let tempAmount = amount;
    let rate = interest_rate / 12;
    while (arr.length < 12) {
        tempAmount += tempAmount * rate;
        arr.push(Math.round(tempAmount));
    }
    return arr;
}
exports.default = default_1;
//# sourceMappingURL=calAccrued.js.map