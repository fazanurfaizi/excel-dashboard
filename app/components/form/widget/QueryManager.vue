<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input 
          v-model.number="queryConfig.limit" 
          label="Limit Results (Set 0 to view All)" 
          outlined 
          dense 
          type="number" 
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input 
          v-model="queryConfig.order" 
          label="Order By (e.g. date:DESC)" 
          outlined 
          dense 
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <config-chart-query-filter 
      v-model="queryConfig.filters" 
      :columns="availableColumns" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: any,
  availableColumns: any[]
}>()

const emit = defineEmits(['update:modelValue'])

const queryConfig = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>