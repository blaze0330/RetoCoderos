<script>
  import Card from "./components/Card.svelte";
  import Form from "./components/Form.svelte";
  import Sent from "./components/Sent.svelte";
  import { isSent } from "./store";
  let isFormSent;
  isSent.subscribe(val => {
    isFormSent = val;
  });
</script>

<div
  class="bg-indigo-100 flex justify-center h-screen flex-col md:flex-row px-3">
  {#if !isFormSent}
    <div
      class="md:w-1/2 flex items-center mb-4 md:mb-0 md:mr-4 w-full lg:max-w-lg">
      <Form />
    </div>
    <Card />
  {:else}
    <Sent />
  {/if}
</div>
