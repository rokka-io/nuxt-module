<template>
  <p id="viewports">{{ Object.keys(VIEWPORTS).join(',') }}</p>
</template>

<script lang="ts" setup>
import { VIEWPORTS } from '#rokka/generated-types'
</script>
