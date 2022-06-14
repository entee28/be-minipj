export default function (amount: number, interest_rate: number) {
  let arr: number[] = [];
  let tempAmount = amount;

  while (arr.length <= 12) {
    tempAmount += tempAmount * interest_rate;
    arr.push(tempAmount);
  }

  return arr;
}
