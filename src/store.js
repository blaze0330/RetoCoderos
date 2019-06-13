import { writable } from "svelte/store";

export const num = writable("4915666431345739");
export const name = writable("Juan Fernando");
export const month = writable("04");
export const year = writable("20");
export const ccv = writable("434");

export const isValid = writable(false);
