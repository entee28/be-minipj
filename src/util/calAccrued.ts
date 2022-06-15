export default function (amount: number, interest_rate: number) {
  let arr: number[] = [];
  let tempAmount = amount;
  let rate = interest_rate / 12;

  while (arr.length < 12) {
    tempAmount += tempAmount * rate;
    arr.push(Math.round(tempAmount));
  }

  return arr;
}
