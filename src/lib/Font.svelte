<script lang="ts">
  import GoogleFont, { getFontStyle } from "@svelte-web-fonts/google";
  import type { GoogleFontDefinition, GoogleFontVariant } from "@svelte-web-fonts/google";

  const fonts: GoogleFontDefinition[] = [
    {
      family: 'Zen Maru Gothic',
      variants: [
          "700" as GoogleFontVariant
      ],
    },
    {
      family: 'Noto Sans JP',
      variants: [
          "700" as GoogleFontVariant
      ],
    },
    {
      family: 'Kosugi Maru',
      variants: [
          "700" as GoogleFontVariant
      ],
    },
  ];
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin={"anonymous"} />
    <GoogleFont fonts={fonts} display="swap"/>
</svelte:head>

<span style="font-family: 'Zen Maru Gothic';">Zen Maru Gothic</span>
<span style="font-family: 'Noto Sans JP';">Noto Sans JP</span>
<span style="font-family: 'Kosugi Maru';">Kosugi Maru</span>

<style>


</style>