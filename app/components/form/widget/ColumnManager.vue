<template>
  <div>
    <div class="q-pa-md">
      <q-markup-table flat bordered dense wrap-cells separator="cell">
        <thead class="bg-grey-1">
          <tr>
            <th style="width: 50px">Action</th>
            <markup-table-th-input>Field ID</markup-table-th-input>
            <markup-table-th-input>Label</markup-table-th-input>
            <markup-table-th-input>Format</markup-table-th-input>
            <markup-table-th-input>Precision</markup-table-th-input>
            <markup-table-th-input>Aggregation</markup-table-th-input>
            <markup-table-th-input v-if="allowHide">Hide Column</markup-table-th-input>
          </tr>
        </thead>
        <tbody>
          <tr v-if="selectedColumns.length === 0">
            <td :colspan="allowHide ? 7 : 6" class="text-center text-grey-6 q-pa-md">
              No columns selected. Please add from the available columns below.
            </td>
          </tr>
          <tr v-for="(v, i) in selectedColumns" :key="i">
            <td class="text-center">
              <q-btn flat dense round color="negative" icon="delete" size="sm" @click="delColumn(i)" />
            </td>
            <td class="bg-grey-1 text-grey-7">{{ v.name }}</td>
            <markup-table-td-input :i="i" v-model="v.label" type="input" />
            <markup-table-td-input :i="i" v-model="v.format" type="select" :options="optFormat" />
            <markup-table-td-input v-if="v.format === 'number'" :i="i" v-model="v.precision" type="number" :precision="0" />
            <td v-else class="bg-grey-2"></td>
            <markup-table-td-input v-if="v.format" :i="i" v-model="v.aggregation" type="select" :options="optAggregation[v.format]" />
            <td v-else class="bg-grey-2"></td>
            <markup-table-td-input v-if="allowHide" :i="i" v-model="v.hideColumn" type="checkbox" />
          </tr>
        </tbody>
      </q-markup-table>
    </div>

    <q-separator />

    <div class="q-pa-md">
      <div class="row justify-between items-center q-mb-xs">
        <div class="text-subtitle2">Available Columns (From Selected Table)</div>
      </div>

      <div class="scroll" style="max-height: 250px">
        <q-markup-table flat bordered dense separator="cell">
          <thead class="bg-grey-1 text-left">
            <tr>
              <th>Column Name</th>
              <th>Type</th>
              <th style="width: 80px" class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="availableColumns.length === 0">
              <td colspan="3" class="text-center text-grey-6 q-pa-md">
                Please select a table and load columns.
              </td>
            </tr>
            <tr v-else v-for="col in availableColumns" :key="col.name">
              <td class="text-weight-medium">{{ col.name }}</td>
              <td class="text-grey-7 text-caption">{{ col.format }}</td>
              <td class="text-center">
                <q-btn flat dense round icon="add_circle" color="positive" size="sm" @click="addColumn(col)">
                  <q-tooltip>Add to Columns</q-tooltip>
                </q-btn>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: any[],
  availableColumns: any[],
  allowHide?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const selectedColumns = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const optFormat = ['text', 'number', 'date', 'datetime']

const optAggregation: Record<string, string[]> = {
  number: ['', 'sum', 'avg', 'min', 'max', 'count'],
  date: ['', 'min', 'max', 'count'],
  datetime: ['', 'min', 'max', 'count'],
  text: ['', 'count']
}

const addColumn = (col: any) => {
  if (selectedColumns.value.find((c: any) => c.name === col.name)) return;

  selectedColumns.value.push({
    id: col.name,
    name: col.name,
    label: col.name,
    format: col.format,
    precision: col.format === 'number' ? 0 : null,
    aggregation: null,
    ...(props.allowHide ? { hideColumn: false } : {})
  })
}

const delColumn = (i: number) => selectedColumns.value.splice(i, 1)
</script>