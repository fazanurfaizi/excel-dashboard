{
type: written_file
fileName: app/components/config/widget/CombineChart.vue
fullContent:
<template>
  <div class="col-12">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select 
          v-model="config.x" 
          label="X-Axis / Category Field" 
          :options="columns" 
          outlined dense options-dense 
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select 
          v-model="config.legend" 
          label="Legend / Grouping Field (Optional)" 
          :options="columns" 
          outlined dense options-dense clearable
        />
      </div>
    </div>

    <div class="text-subtitle2 text-grey-8 q-mb-sm flex items-center justify-between">
      <div class="flex items-center">
        <q-icon name="add_chart" size="xs" class="q-mr-xs" />
        <span>Series Configuration</span>
      </div>
      <q-btn flat dense icon="add" label="Add Series" color="primary" size="sm" @click="addSeries" />
    </div>

    <q-markup-table flat bordered dense wrap-cells separator="cell">
      <thead class="bg-grey-1">
        <tr>
          <th rowspan="2">Action</th>
          <th rowspan="2" style="min-width: 120px">Field (Value)</th>
          <th rowspan="2">Name (Label)</th>
          <th rowspan="2">Type</th>
          <th rowspan="2">Axis</th>
          <th rowspan="2">Color</th>
          <th rowspan="2">Opacity</th>
          <th colspan="3">Data Label</th>
          <th colspan="2">Line Option</th>
        </tr>
        <tr>
          <th style="font-size: 10px">Show</th>
          <th style="font-size: 10px">Position</th>
          <th style="font-size: 10px">Size</th>
          <th style="font-size: 10px">Width</th>
          <th style="font-size: 10px">Dash</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(v, i) in config.series" :key="i">
          <td class="text-center">
            <q-btn flat dense round color="negative" icon="delete" size="sm" @click="delSeries(i)" />
          </td>
          
          <MarkupTableTdInput 
            :i="i" v-model="v.field" type="select" 
            :options="columns" 
            dense borderless 
          />
          
          <MarkupTableTdInput :i="i" v-model="v.name" placeholder="Auto" dense borderless />

          <MarkupTableTdInput 
            :i="i" v-model="v.type" type="select" 
            :options="['column', 'line', 'area', 'scatter']" 
            dense borderless 
          />

          <MarkupTableTdInput 
            :i="i" v-model="v.axis" type="select" 
            :options="['y', 'y2']" 
            dense borderless 
          />

          <td class="text-center">
             <q-btn flat dense size="sm" icon="colorize" :style="{ color: v.color || '#000' }">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="v.color" no-header no-footer default-view="palette" />
              </q-popup-proxy>
            </q-btn>
          </td>

          <MarkupTableTdInput 
            :i="i" v-model="v.opacity" type="number" :step="0.1" :min="0" :max="1" 
            dense borderless 
          />

          <MarkupTableTdInput 
            :i="i" v-model="v.datalabel.show" type="select"
            :options="['none', 'all', 'min-max', 'last']"
            dense borderless 
          />
          <MarkupTableTdInput 
            :i="i" v-model="v.datalabel.position" type="select"
            :options="['auto', 'inside', 'outside']"
            dense borderless 
          />
           <MarkupTableTdInput 
            :i="i" v-model="v.datalabel.fontsize" type="number" 
            dense borderless 
          />

          <template v-if="['line', 'scatter', 'area'].includes(v.type)">
            <MarkupTableTdInput :i="i" v-model="v.width" type="number" dense borderless />
            <MarkupTableTdInput 
              :i="i" v-model="v.dash" type="select" 
              :options="['solid', 'dot', 'dash', 'longdash', 'dashdot']"
              dense borderless 
            />
          </template>
          <template v-else>
            <td class="bg-grey-2"></td>
            <td class="bg-grey-2"></td>
          </template>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import type { ChartConfig } from '~~/types/dashboard';

const props = defineProps<{
  modelValue: ChartConfig;
  columns: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChartConfig): void;
}>();

const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const addSeries = () => {
  if (!config.value.series) config.value.series = []
  config.value.series.push({
    field: null,
    type: 'column',
    axis: 'y',
    name: '',
    color: null,
    opacity: 1,
    datalabel: { show: 'none', position: 'auto', fontsize: 10 },
    width: 2,
    dash: 'solid'
  } as any)
}

const delSeries = (i: number) => {
  if (config.value.series) config.value.series.splice(i, 1)
}
</script>
}