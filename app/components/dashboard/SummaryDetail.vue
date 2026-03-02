<template>
  <q-card flat class="full-width">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title class="text-subtitle1 text-weight-bold">Detail Status: {{ project.title }}</q-toolbar-title>      
    </q-toolbar>
    <q-card-section class="q-pa-none">
      <q-table :rows="project.data" :columns="[
        { name: 'pic', label: 'PIC (PM)', field: 'pic', align: 'left', sortable: true },
        { name: 'year', label: 'Tahun', field: 'year', align: 'center', sortable: true },
        { name: 'count', label: 'Total Project', field: 'count', align: 'right', sortable: true }
      ]" row-key="pic" flat bordered hide-pagination :pagination="{ rowsPerPage: 0 }" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">

const props = defineProps<{
  project: any
}>()

</script>