<script>
  import { num, name, month, year, ccv } from "../store";
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
    console.log(cardType);
  }
  $: ccNum = store_num
    .replace(/[^\dA-Z]/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
</script>

<style>
  .cc {
    background-size: contain;
    background-blend-mode: multiply;
    text-shadow: 0 2px 1px rgba(0, 0, 0, 0.4);
  }
  .chip {
    width: 32px;
    height: 32px;
  }
</style>

<div class="test w-full md:max-w-lg flex items-center">
  <div
    class="cc pt-ar relative w-full rounded-lg shadow"
    style="background-image:
    url('http://www.pngmart.com/files/3/World-Map-PNG-Photos.png'), {cardType ? cardTypes[cardType].background : 'linear-gradient(0deg, #e2e8f0 0%, #e2e8f0 100%)'};
    color: {cardType ? cardTypes[cardType].color : '#444'}; ">
    <div class="absolute inset-0 flex flex-col justify-between p-8">
      <div class="flex justify-between items-center">
        <img
          src="https://cdn0.iconfinder.com/data/icons/fatcow/32/card_chip_gold.png"
          class="chip"
          alt="Chip" />
        {#if cardType}
          <img
            src={cardTypes[cardType].icon}
            alt={cardType}
            class="w-auto h-16" />
        {/if}
      </div>

      <div class="test text-center text-2xl font-medium tracking-wide">
         {ccNum}
      </div>
      <div class="flex justify-between items-center">
        <div>{store_name}</div>
        <div class="flex items-center">
          <span class="text-xs text-white mr-1">Good Thru:</span>
          <span>{store_month}/{store_year}</span>
        </div>
      </div>
    </div>
  </div>
</div>
