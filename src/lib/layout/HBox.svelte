<script lang="ts">
  export let className = "";
</script>

<div class={`hbox ${className}`}>
  <slot/>
</div>

<style>
  .hbox {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>
