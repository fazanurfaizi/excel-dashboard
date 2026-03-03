<template>
  <q-card flat class="bg-transparent">
    <q-form @submit="updateData">
      <form-widget-config-header title="Table Configuration" />

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
          <form-widget-general-setting 
            v-model:title="dataModel.title" 
            v-model:dataSource="dataModel.config.dataSource"
            title-class="col-12"
            data-source-class="col-12 col-md-6"
            @change:data-source="loadTableSchema"
          />          
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card bordered flat>
            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary"
              align="justify" narrow-indicator>
              <q-tab name="columns" icon="view_column" label="Columns" />
              <q-tab name="query" icon="filter_alt" label="Query / Filter" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated class="q-pa-none">
              <q-tab-panel name="columns" class="q-pa-none">
                <form-widget-column-manager v-model="dataModel.config.columns" :available-columns="rawData.cols" allow-hide />
              </q-tab-panel>

              <q-tab-panel name="query">
                <form-widget-query-manager v-model="dataModel.config.query" :available-columns="rawData.cols" />
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import type { WidgetData } from '~~/types/dashboard';
import { TABLE_SCHEMAS } from '~~/app/utils/constants';

useResizableTh()
useRowKeyboardMove()

const props = defineProps<{ modelValue: WidgetData }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const tab = ref('columns')

const dataModel = ref<WidgetData>(JSON.parse(JSON.stringify(props.modelValue)))
if (!dataModel.value.config) dataModel.value.config = { query: { filters: [] }, columns: [] } as any
if (!dataModel.value.config.query) dataModel.value.config.query = { limit: 0, order: '', filters: [] }
if (!dataModel.value.config.columns) dataModel.value.config.columns = []

if (!dataModel.value.config.dataSource) {
  dataModel.value.config.dataSource = []
} else if (typeof dataModel.value.config.dataSource === 'string') {
  dataModel.value.config.dataSource = [dataModel.value.config.dataSource] 
}

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

const updateData = () => {
  emit('update:modelValue', dataModel.value)
  emit('submit', dataModel.value)
}

onMounted(() => {
  if (dataModel.value.config.dataSource) {
    loadTableSchema()
  }
})
</script>