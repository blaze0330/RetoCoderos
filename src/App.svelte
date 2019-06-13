<script>
  import Card from "./components/Card.svelte";
  import Form from "./components/Form.svelte";
  let num = "";
</script>

<div
  class="sm:bg-red-400 md:bg-blue-400 lg:bg-green-400 xl:bg-indigo-400 flex
  justify-center h-screen flex-col sm:flex-row px-3">
  <div class="w-full sm:w-2/5 md:w-1/2 flex items-center mb-4 sm:mb-0">
    <Form />
  </div>
  <!-- <div class="w-full sm:w-3/5 md:w-1/2 flex items-center"> -->
  <Card />
  <!-- </div> -->
</div>
