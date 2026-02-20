<template>
  <div class="col-12">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select 
          v-model="chartConfig.x" 
          label="X-Axis / Category Field" 
          :options="columns" 
          :option-label="(v) => v.label || v.name" 
          option-value="name"
          emit-value map-options outlined dense 
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select 
          v-model="chartConfig.legend" 
          label="Legend / Grouping Field (Optional)" 
          :options="columns" 
          :option-label="(v) => v.label || v.name" 
          option-value="name"
          emit-value map-options outlined dense clearable
        />
      </div>
    </div>

    <div class="text-subtitle2 text-grey-8 q-mb-sm flex items-center justify-between">
      <div class="flex items-center">
        <q-icon name="stacked_line_chart" size="xs" class="q-mr-xs" />
        <span>Series Configuration (Y-Axis)</span>
      </div>
      <q-btn flat dense icon="add" label="Add Series" color="primary" size="sm" @click="addSeries" />
    </div>

    <q-markup-table flat bordered dense wrap-cells separator="cell">
      <thead class="bg-grey-1">
        <tr>
          <th style="width: 50px">Action</th>
          <th class="text-left">Field (Value)</th>
          <th class="text-left">Target Axis</th>
          <th class="text-left">Chart Type</th>
          <th class="text-left">Mode</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!chartConfig.series || chartConfig.series.length === 0">
          <td colspan="5" class="text-center text-grey-6 q-pa-md">No series added.</td>
        </tr>
        <tr v-for="(v, i) in chartConfig.series" :key="i">
          <td class="text-center">
            <q-btn flat dense round color="negative" icon="delete" size="sm" @click="delSeries(i)" />
          </td>
          <td>
            <q-select 
              v-model="v.field" 
              :options="columns" 
              :option-label="(col: any) => col.label || col.name" 
              option-value="name"
              emit-value map-options dense borderless
            />
          </td>
          <td>
            <q-select v-model="v.axis" :options="['y', 'y2']" dense borderless />
          </td>
          <td>
            <q-select v-model="v.type" :options="['column', 'line', 'area', 'scatter']" dense borderless />
          </td>
          <td>
            <q-select 
              v-if="v.type !== 'column'" 
              v-model="v.mode" 
              :options="['lines', 'lines+markers', 'markers']" 
              dense borderless 
            />
            <div v-else class="text-grey-5 q-pa-sm">N/A</div>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
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

const addSeries = () => {
  if (!chartConfig.value.series) chartConfig.value.series = [];
  chartConfig.value.series.push({
    field: null,
    axis: 'y',
    type: 'column',
    mode: 'lines'
  });
};

const delSeries = (i: number) => {
  chartConfig.value.series.splice(i, 1);
};
</script>