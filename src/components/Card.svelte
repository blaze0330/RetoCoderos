<script>
  import Payment from "payment";
  export let number = "";
  export let name = "";
  export let month = "";
  export let year = "";
  export let ccv = "";

  let cardType;
  let isNumberValid = false;
  let isDateValid = false;
  let isCcvValid = false;
  let isValid = false;

  $: {
    cardType = Payment.fns.cardType(number);
    isNumberValid = Payment.fns.validateCardNumber(number);
    isCcvValid = Payment.fns.validateCardCVC(ccv);
    isDateValid = Payment.fns.validateCardExpiry(month, year);

    isValid = isNumberValid && isCcvValid && isDateValid;
  }
</script>

<div class="w-full">
  <div class="pt-ar bg-white relative rounded-lg shadow">
    <div class="absolute inset-0">{cardType}</div>
  </div>
</div>
