<script>
  import { num, name, month, year, ccv, isValid } from "../store";
  let isValidCC;
  isValid.subscribe(val => {
    isValidCC = val;
  });
</script>

<div class="bg-white shadow p-8 rounded-lg">
  <div class="flex items-center mb-4">
    <div
      class="w-1/4 border-2 border-indigo-400 px-2 py-2 rounded-full font-bold
      mr-2">
      <svg class="w-full fill-current text-indigo-400" viewBox="0 0 500 500">
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
    <h2 class="text-lg font-medium text-gray-800">Your Payment Information</h2>
  </div>

  <div class="mb-4">
    <label for="payment" class="block text text-gray-700 mb-2">
      Name on card
    </label>
    <input
      type="text"
      class="w-full flex-1 text-sm bg-gray-200 text-gray-700 rounded p-3
      focus:outline-none"
      bind:value={$name}
      placeholder="John Doe" />
  </div>
  <div>
    <label for="payment" class="block text text-gray-700 mb-2">
      Credit Card info
    </label>
    <div class="flex flex-row sm:flex-col lg:flex-row">
      <div class="flex w-1/2 sm:block sm:w-full">
        <input
          type="text"
          class="w-full flex-1 text-sm bg-gray-200 text-gray-700 pl-3 py-3
          focus:outline-none rounded-l sm:rounded-b-none sm:rounded-t
          lg:rounded-r-none lg:rounded-l"
          bind:value={$num}
          placeholder="Card Number"
          maxlength="16" />
      </div>
      <div class="flex w-full lg:w-1/2">
        <input
          type="text"
          class="w-1/3 block text-sm bg-gray-200 text-gray-700 py-3
          focus:outline-none sm:pl-3 sm:rounded-bl lg:rounded-none"
          bind:value={$month}
          placeholder="MM" />
        <input
          type="text"
          class="w-1/3 block text-sm bg-gray-200 text-gray-700 py-3
          focus:outline-none"
          bind:value={$year}
          placeholder="YY" />
        <input
          type="text"
          class="w-1/3 block text-sm bg-gray-200 text-gray-700 py-3 pr-y
          focus:outline-none rounded-r sm:rounded-br sm:rounded-tr-none
          lg:rounded-r"
          bind:value={$ccv}
          placeholder="CCV" />
      </div>
    </div>
  </div>
  {#if isValidCC}
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 w-full mt-6
      rounded">
      Button
    </button>
  {/if}
</div>
