<script>
  import { num, name, month, year, ccv, isValid } from "../store";
  import Payment from "payment";

  let store_num, store_name, store_month, store_year, store_ccv;

  num.subscribe(val => {
    store_num = val;
  });
  name.subscribe(val => {
    store_name = val;
  });
  month.subscribe(val => {
    store_month = val;
  });
  year.subscribe(val => {
    store_year = val;
  });
  ccv.subscribe(val => {
    store_ccv = val;
  });

  let cardType;
  let isNumberValid = false;
  let isDateValid = false;
  let isCcvValid = false;

  let cardTypes = {
    visa: {
      background:
        "linear-gradient(28deg, rgba(26,55,113,1) 0%, rgba(81,110,153,1) 50%, rgba(26,50,113,1) 100%)",
      color: "#c4dcff",
      icon:
        "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-08-512.png"
    },
    mastercard: {
      color: "#fff0db",
      background:
        "linear-gradient(0deg, rgba(105,83,57,1) 0%, rgba(231,184,116,1) 100%)",
      icon:
        "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-07-512.png"
    },
    amex: {
      background:
        "linear-gradient(0deg, rgba(145,158,164,1) 0%, rgba(215,224,228,1) 100%)",
      color: "#3e535e",
      icon:
        "https://cdn0.iconfinder.com/data/icons/major-credit-cards-colored/48/JD-05-512.png"
    }
  };

  $: {
    cardType = Payment.fns.cardType(store_num);
    isNumberValid = Payment.fns.validateCardNumber(store_num);
    isCcvValid = Payment.fns.validateCardCVC(store_ccv);
    isDateValid = Payment.fns.validateCardExpiry(store_month, store_year);
    console.log(store_num, store_month, store_year, store_ccv);
    console.log(isNumberValid, isCcvValid, isDateValid);
    isValid.set(isNumberValid && isCcvValid && isDateValid);
  }
</script>

<style>
  .card {
    text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.6);
  }
</style>

<div class="w-full md:max-w-lg">
  <div
    class="pt-ar relative rounded-lg shadow"
    style="background: {cardType ? cardTypes[cardType].background : 'white'};
    color: {cardType ? cardTypes[cardType].color : '#444'};">
    <div class="absolute inset-0 flex flex-col justify-between p-8">
      <img
        src="https://cdn0.iconfinder.com/data/icons/fatcow/32/card_chip_gold.png"
        style="width: 32px; height: 32px;"
        alt="Chip" />
      <div class="text-center text-2xl font-medium tracking-wide">
         {store_num}
      </div>
      <div class="text-center">{store_month}/{store_year}</div>
      <div class="flex justify-between items-center">
        <div>{store_name}</div>
        {#if cardType}
          <img
            src={cardTypes[cardType].icon}
            alt={cardType}
            class="w-auto h-16" />
        {/if}
      </div>
    </div>
  </div>
</div>
