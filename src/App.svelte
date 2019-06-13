<script>
  import Card from "./components/Card.svelte";
  import Form from "./components/Form.svelte";
  let num = "";
</script>

<div class="w-1/2 mx-auto flex h-screen">
  <div class="w-2/5 flex items-center mx-2">
    <Form />
  </div>
  <input type="text" bind:value={num} />
  <div class="w-3/5 flex items-center mx-2">
    <Card number={num} />
  </div>
</div>
