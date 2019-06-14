<script>
  import {
    num,
    name,
    month,
    year,
    ccv,
    isNumberValid,
    isCcvValid,
    isDateValid,
    isSent
  } from "../store";

  let store_isNumberValid;
  let store_isCcvValid;
  let store_isDateValid;

  let hasEditedNumber = false;
  let hasEditedMonth = false;
  let hasEditedYear = false;
  let hasEditedCcv = false;

  num.subscribe(val => {
    hasEditedNumber = val.length > 0;
  });
  month.subscribe(val => {
    hasEditedMonth = val.length > 0;
  });
  year.subscribe(val => {
    hasEditedMonth = val.length > 0;
  });
  ccv.subscribe(val => {
    hasEditedCcv = val.length > 0;
  });

  isNumberValid.subscribe(val => {
    store_isNumberValid = val;
  });
  isCcvValid.subscribe(val => {
    store_isCcvValid = val;
  });
  isDateValid.subscribe(val => {
    store_isDateValid = val;
  });

  let sendCard = () => {
    isSent.set(isValid);
  };

  $: hasEditedDate = hasEditedMonth && hasEditedMonth;
  $: isValid = store_isNumberValid && store_isCcvValid && store_isDateValid;
</script>

<div class="bg-white shadow p-8 rounded-lg w-full">
  <div class="flex items-center mb-4">
    <div
      class="w-1/4 md:w-16 border-2 border-blue-400 px-2 py-2 rounded-full
      font-bold mr-2">
      <svg class="w-full fill-current text-blue-400" viewBox="0 0 500 500">
        <path
          d="M272.715,286.341H145.518c-12.538,0-22.715,10.179-22.715,22.715
          s10.177,22.716,22.715,22.716h127.197c12.537,0,22.712-10.18,22.712-22.716S285.252,286.341,272.715,286.341z
          M31.949,386.284
          c0,20.079,16.264,36.34,36.34,36.34h363.421c20.078,0,36.34-16.261,36.34-36.34V113.718c0-20.079-16.262-36.343-36.34-36.343H68.29
          c-20.077,0-36.34,16.264-36.34,36.343V386.284z
          M97.367,122.802h305.267c11.084,0,19.99,8.909,19.99,19.991v25.438H77.375v-25.438
          C77.375,131.711,86.28,122.802,97.367,122.802z
          M77.375,240.914h345.249v116.292c0,11.081-8.906,19.992-19.99,19.992H97.367
          c-11.086,0-19.991-8.911-19.991-19.992V240.914z" />
      </svg>
    </div>
    <h2 class="text-xl font-medium text-blue-800 ml-2">
      Agregar un método de pago
    </h2>
  </div>

  <div class="mb-4">
    <label for="payment" class="block text text-gray-700 mb-2">
      Nombre en la tarjeta
    </label>
    <input
      type="text"
      class="w-full flex-1 text-sm bg-gray-200 text-gray-700 rounded p-3
      focus:outline-none"
      bind:value={$name}
      placeholder="John Doe"
      maxlength="20" />
  </div>
  <div>
    <label for="payment" class="block text text-gray-700 mb-2">
      Número en la tarjeta
    </label>
    <div class="flex w-1/2 sm:block sm:w-full mb-4">
      <input
        type="text"
        class="w-full flex-1 text-sm bg-gray-200 text-gray-700 pl-3 py-3 rounded
        focus:outline-none"
        bind:value={$num}
        placeholder="Card Number"
        maxlength="16" />
      {#if !store_isNumberValid && hasEditedNumber}
        <span class="text-red-400 text-sm">La tarjeta no es valida</span>
      {/if}
    </div>
    <div class="flex w-full">
      <div class="w-1/5 flex flex-col">
        <label for="payment" class="block text text-gray-700 mb-2">Mes</label>
        <input
          type="text"
          class="block text-center text-sm bg-gray-200 text-gray-700 py-3 px-3
          rounded-l focus:outline-none"
          bind:value={$month}
          placeholder="MM" />
      </div>
      <div class="w-1/5 flex flex-col">
        <label for="payment" class="block text text-gray-700 mb-2">Año</label>
        <input
          type="text"
          class="block text-center text-sm bg-gray-200 text-gray-700 py-3 px-3
          rounded-r focus:outline-none"
          bind:value={$year}
          placeholder="YY" />
      </div>
      <div class="w-1/5 flex flex-col ml-auto">
        <label for="payment" class="block text text-gray-700 mb-2">CCV</label>
        <input
          type="text"
          class="block text-center text-sm bg-gray-200 text-gray-700 py-3 px-3
          rounded focus:outline-none"
          bind:value={$ccv}
          placeholder="CCV" />
      </div>
    </div>
    {#if !store_isDateValid && hasEditedDate}
      <span class="text-red-400 text-sm">La fecha no es valida</span>
    {/if}
    {#if !store_isCcvValid && hasEditedCcv}
      <span class="block text-right text-red-400 text-sm">
        El CCV no es valido
      </span>
    {/if}

  </div>
  <button
    class={isValid ? 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 w-full mt-6 rounded focus:outline-none' : 'bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 w-full mt-6 rounded focus:outline-none'}
    on:click={sendCard}>
    Continue
  </button>
</div>
