<template>
  <div class="col-12">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select 
          v-model="chartConfig.x" 
          label="Labels (Dimension / Category)" 
          :options="columns" 
          :option-label="(v) => v.label || v.name" 
          option-value="name"
          emit-value map-options outlined dense 
        />
      </div>
      
      <div class="col-12 col-md-6">
        <q-select 
          v-model="donutValueField" 
          label="Values (Metric / Number)" 
          :options="columns" 
          :option-label="(v) => v.label || v.name" 
          option-value="name"
          emit-value map-options outlined dense 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WidgetData } from '~~/types/dashboard';

const props = defineProps<{
  modelValue: WidgetData['config']['chart'];
  columns: WidgetData['config']['columns'];
}>();

const emit = defineEmits(['update:modelValue']);

const chartConfig = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const donutValueField = computed({
  get: () => chartConfig.value.series?.[0]?.field || null,
  set: (val) => {
    if (!chartConfig.value.series) {
      chartConfig.value.series = [];
    }
    if (!chartConfig.value.series[0]) {
      chartConfig.value.series[0] = { field: val, axis: 'y', type: 'pie' };
    } else {
      chartConfig.value.series[0].field = val;
    }
  }
});
</script>