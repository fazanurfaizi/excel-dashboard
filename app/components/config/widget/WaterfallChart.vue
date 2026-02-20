<template>
  <div class="col-12">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="chartConfig.x"
          label="X-Axis (Category)"
          :options="columns"
          :option-label="(v: any) => v.label || v.name"
          option-value="name"
          emit-value
          map-options
          outlined
          dense
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="waterfallValueField"
          label="Y-Axis (Value / Delta)"
          :options="columns"
          :option-label="(v: any) => v.label || v.name"
          option-value="name"
          emit-value
          map-options
          outlined
          dense
        />
      </div>
      
      <div class="col-12">
        <q-select
          v-model="measureColumn"
          label="Measure Column (Optional)"
          hint="Kolom yang mendefinisikan tipe bar (relative, total, absolute)"
          :options="columns"
          :option-label="(v: any) => v.label || v.name"
          option-value="name"
          emit-value
          map-options
          outlined
          dense
          clearable
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <div class="text-subtitle2 text-grey-8 q-mb-sm">Waterfall Colors</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-input v-model="colors.increasing" label="Increasing" outlined dense>
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="colors.increasing" no-header no-footer />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <q-input v-model="colors.decreasing" label="Decreasing" outlined dense>
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="colors.decreasing" no-header no-footer />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <q-input v-model="colors.total" label="Total" outlined dense>
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="colors.total" no-header no-footer />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
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

const ensureOptionsExists = () => {
  if (!chartConfig.value.options) chartConfig.value.options = {};
  if (!chartConfig.value.options.config) chartConfig.value.options.config = {};
};

const waterfallValueField = computed({
  get: () => chartConfig.value.series?.[0]?.field || null,
  set: (val) => {
    if (!chartConfig.value.series) chartConfig.value.series = [];
    if (!chartConfig.value.series[0]) {
      chartConfig.value.series[0] = { field: val, axis: 'y', type: 'auto' };
    } else {
      chartConfig.value.series[0].field = val;
    }
  }
});

const measureColumn = computed({
  get: () => chartConfig.value.options?.config?.measureColumn || null,
  set: (val) => {
    ensureOptionsExists();
    chartConfig.value.options!.config.measureColumn = val;
  }
});

const colors = computed({
  get: () => ({
    increasing: chartConfig.value.options?.config?.increasingColor || '#2E7D32',
    decreasing: chartConfig.value.options?.config?.decreasingColor || '#D32F2F',
    total: chartConfig.value.options?.config?.totalColor || '#1976D2'
  }),
  set: (val) => {
    ensureOptionsExists();
    chartConfig.value.options!.config.increasingColor = val.increasing;
    chartConfig.value.options!.config.decreasingColor = val.decreasing;
    chartConfig.value.options!.config.totalColor = val.total;
  }
});
</script>