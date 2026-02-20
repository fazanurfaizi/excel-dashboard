<template>
  <div class="col-12">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="chartConfig.x"
          label="X-Axis (Timeline)"
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
          v-model="sparklineValueField"
          label="Y-Axis (Value)"
          :options="columns"
          :option-label="(v: any) => v.label || v.name"
          option-value="name"
          emit-value
          map-options
          outlined
          dense
        />
      </div>
    </div>
    
    <q-separator class="q-my-md" />

    <div class="text-subtitle2 text-grey-8 q-mb-sm">Sparkline Style</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="sparklineType"
          label="Chart Style"
          :options="['line', 'area', 'column']"
          outlined
          dense
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="sparklineColor"
          label="Line/Bar Color"
          outlined
          dense
        >
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="sparklineColor" no-header no-footer />
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

const sparklineValueField = computed({
  get: () => chartConfig.value.series?.[0]?.field || null,
  set: (val) => {
    if (!chartConfig.value.series) chartConfig.value.series = [];
    if (!chartConfig.value.series[0]) {
      chartConfig.value.series[0] = { field: val, axis: 'y', type: 'line' };
    } else {
      chartConfig.value.series[0].field = val;
    }
  }
});

const sparklineType = computed({
  get: () => chartConfig.value.series?.[0]?.type || 'line',
  set: (val) => {
    if (chartConfig.value.series?.[0]) {
      chartConfig.value.series[0].type = val as any;
    }
  }
});

const sparklineColor = computed({
  get: () => chartConfig.value.options?.config?.sparklineColor || '#2196F3',
  set: (val) => {
    ensureOptionsExists();
    chartConfig.value.options!.config.sparklineColor = val;
  }
});
</script>