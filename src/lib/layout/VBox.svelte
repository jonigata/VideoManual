<script lang="ts">
  export let className = "";
</script>

<div class={`vbox ${className}`}>
  <slot/>
</div>

<style>
  .vbox {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>
