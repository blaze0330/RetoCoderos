import { writable, derived } from "svelte/store";
import Payment from "payment";

export const num = writable("4915666431345739");
export const name = writable("Juan Fernando");
export const month = writable("04");
export const year = writable("20");
export const ccv = writable("434");

export const isNumberValid = derived(num, $num =>
  Payment.fns.validateCardNumber($num)
);
export const isCcvValid = derived(ccv, $ccv =>
  Payment.fns.validateCardCVC($ccv)
);
export const isDateValid = derived([month, year], ([$month, $year]) =>
  Payment.fns.validateCardExpiry($month, $year)
);
