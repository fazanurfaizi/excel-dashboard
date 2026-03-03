<template>
  <div class="row justify-between items-center q-mb-md">
    <div class="text-h6 text-weight-bold text-grey-8">{{ title }}</div>
    <div class="row q-gutter-sm">
      <q-btn label="Cancel" flat v-close-popup color="grey-7" />
      <q-btn type="submit" color="primary" icon="save" label="Update Widget" unelevated />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>