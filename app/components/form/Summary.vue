<template>
  <q-card flat class="bg-transparent">
    <q-form @submit="updateData()">
      
      <form-widget-config-header title="Project Summary Configuration" />

      <form-widget-general-setting 
        v-model:title="dataModel.title" 
        v-model:dataSource="dataModel.config.dataSource"
        title-class="col-12"
        data-source-class="col-12 col-md-6"
        multiple-data-source
      >
        <div class="col-12 col-md-6">
          <q-select 
            v-model="dataModel.config.summaryTemplate" 
            label="Template Type" 
            :options="templateOptions" 
            emit-value 
            map-options
            outlined 
            dense 
          />
        </div>
      </form-widget-general-setting>      
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WidgetData } from '~~/types/dashboard'

const props = defineProps<{ modelValue: WidgetData }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const dataModel = ref<WidgetData>(JSON.parse(JSON.stringify(props.modelValue)))

if (!dataModel.value.config) dataModel.value.config = {} as any
if (!dataModel.value.config.summaryTemplate) dataModel.value.config.summaryTemplate = 'executive'
if (!dataModel.value.config.dataSource) dataModel.value.config.dataSource = ['installations', 'procurements']

const templateOptions = [
  { label: 'Executive (Detail Status & Kwp)', value: 'executive' },
  { label: 'Monitoring (Total Project Only)', value: 'monitoring' }
]

const dataSourceOptions = [
  { label: 'Installations', value: 'installations' },
  { label: 'Procurements', value: 'procurements' }
]

const updateData = () => {
  emit('update:modelValue', dataModel.value)
  emit('submit', dataModel.value)
}

watch(() => props.modelValue, (newVal) => {
  dataModel.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })
</script>