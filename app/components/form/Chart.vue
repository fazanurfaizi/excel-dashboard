<template>
  <q-card flat class="bg-transparent">
    <q-form @submit="submit">
      <form-widget-config-header title="Chart Configuration" />

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
          <form-widget-general-setting 
            v-model:title="dataModel.title" 
            v-model:dataSource="dataModel.config.dataSource"
            title-class="col-12"
            data-source-class="col-12 col-md-6"
            multiple-data-source
            @change:data-source="loadTableSchema"
          >
          <div class="col-12 col-md-6">
            <q-select v-model="dataModel.type" label="Widget Type" :options="widgetTypeOptions" emit-value map-options outlined dense />
          </div>          
          </form-widget-general-setting>          
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card bordered flat>
            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary"
              align="justify" narrow-indicator>
              <q-tab name="columns" icon="view_column" label="Columns" />
              <q-tab name="query" icon="filter_alt" label="Query / Filter" />
              <q-tab v-if="!isTable" name="chart" icon="insert_chart" label="Chart Settings" />
              <q-tab v-if="!isTable" name="style" icon="palette" label="Styles" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated class="q-pa-none">
              <q-tab-panel name="columns" class="q-pa-none">
                <form-widget-column-manager v-model="dataModel.config.columns" :available-columns="rawData.cols" />
              </q-tab-panel>

              <q-tab-panel name="query">
                <form-widget-query-manager v-model="dataModel.config.query" :available-columns="rawData.cols" />
              </q-tab-panel>

              <q-tab-panel name="chart">
                <config-widget-basic-chart 
                  v-if="isBasic" 
                  v-model="dataModel.config.chart" 
                  :columns="dataModel.config.columns" 
                />

                <config-widget-donut-chart 
                  v-else-if="isDonut" 
                  v-model="dataModel.config.chart" 
                  :columns="dataModel.config.columns" 
                />

                <config-widget-waterfall-chart 
                  v-else-if="isWaterfall" 
                  v-model="dataModel.config.chart" 
                  :columns="dataModel.config.columns" 
                />

                <config-widget-sparkline-chart 
                  v-else-if="isSparkline" 
                  v-model="dataModel.config.chart" 
                  :columns="dataModel.config.columns" 
                />
              </q-tab-panel>

              <q-tab-panel name="style" v-if="!isTable">
                <config-chart-style v-model="dataModel.config.chartStyles" />
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </q-form>
  </q-card>
</template>


<script setup lang="ts">
import type { WidgetData } from '~~/types/dashboard'

useResizableTh()
useRowKeyboardMove()

const props = defineProps<{ modelValue: WidgetData }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const tab = ref('columns')

const dataModel = ref<WidgetData>(JSON.parse(JSON.stringify(props.modelValue)))

if (!dataModel.value.config) dataModel.value.config = { query: { filters: [] }, columns: [], chart: { series: [] } } as any
if (!dataModel.value.config.query) dataModel.value.config.query = { limit: 0, order: '', filters: [] }
if (!dataModel.value.config.chart) dataModel.value.config.chart = { type: 'column', series: [], x: null, legend: null }
if (!dataModel.value.config.chart.series) dataModel.value.config.chart.series = []
if (!dataModel.value.config.columns) dataModel.value.config.columns = []
if (!dataModel.value.config.dataSource) {
  dataModel.value.config.dataSource = []
} else if (typeof dataModel.value.config.dataSource === 'string') {
  dataModel.value.config.dataSource = [dataModel.value.config.dataSource] 
}


const widgetTypeOptions = WIDGET_OPTIONS

const isTable = computed(() => dataModel.value.type === 'inventory' || dataModel.value.type === 'table')
const isBasic = computed(() => ['basic_chart', 'bar_chart', 'area_chart'].includes(dataModel.value.type))
const isWaterfall = computed(() => dataModel.value.type === 'waterfall_chart')
const isDonut = computed(() => dataModel.value.type === 'donut_chart')
const isSparkline = computed(() => dataModel.value.type === 'sparkline_chart')

const rawData = ref<{ cols: any[] }>({ cols: [] })

const loadTableSchema = () => {
  const selectedTables = dataModel.value.config.dataSource as string[];
  
  if (!selectedTables || !Array.isArray(selectedTables) || selectedTables.length === 0) {
    rawData.value = { cols: [] };
    return;
  }

  let combinedCols: any[] = [];
  
  selectedTables.forEach(table => {
    if (TABLE_SCHEMAS[table]) {
      // Prefix column names to avoid collisions (e.g., "procurements.id")
      const tableCols = TABLE_SCHEMAS[table].map((col: any) => ({
        ...col,
        name: `${table}.${col.name}`, 
        label: `${table} - ${col.label || col.name}`
      }));
      
      combinedCols = [...combinedCols, ...tableCols];
    }
  });

  rawData.value = { cols: combinedCols };
}

onMounted(() => {
  if (dataModel.value.config.dataSource) {
    loadTableSchema()
  }
})

const submit = () => {
  if (isDonut.value) dataModel.value.config.chart.type = 'pie'
  else if (isBasic.value) dataModel.value.config.chart.type = 'column'

  emit('update:modelValue', dataModel.value)
  emit('submit', dataModel.value)
}

</script>