import { writable, derived } from "svelte/store";
import Payment from "payment";

export const num = writable("");
export const name = writable("");
export const month = writable("");
export const year = writable("");
export const ccv = writable("");

export const isSent = writable(false);

export const isNumberValid = derived(num, $num =>
  Payment.fns.validateCardNumber($num)
);
export const isCcvValid = derived(ccv, $ccv =>
  Payment.fns.validateCardCVC($ccv)
);
export const isDateValid = derived([month, year], ([$month, $year]) =>
  Payment.fns.validateCardExpiry($month, $year)
);
