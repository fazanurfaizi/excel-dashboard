<template>
  <q-card bordered flat class="q-mb-md">
    <q-card-section>
      <div class="row justify-between items-center q-mb-sm">
        <div class="text-subtitle2 text-weight-bold text-grey-7">General Settings</div>
        
        <q-btn 
          outline
          size="sm"
          color="primary" 
          icon="table_view" 
          label="Open Spreadsheet" 
          :href="spreadsheetUrl"
          target="_blank"
        />
      </div>
      
      <div class="row q-col-gutter-md">
        <div :class="titleClass">
          <q-input 
            v-model="title" 
            label="Widget Title" 
            outlined 
            dense 
            placeholder="Enter widget title..." 
          />
        </div>
        
        <div :class="dataSourceClass">
          <q-select 
            v-model="dataSource" 
            label="Data Source" 
            :options="dataSourceOptions" 
            :multiple="multipleDataSource"
            :use-chips="multipleDataSource"
            emit-value 
            map-options
            outlined 
            dense 
            hint="Select tables to aggregate"
            @update:model-value="$emit('change:dataSource', $event)"
          />
        </div>

        <slot></slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()

const props = withDefaults(defineProps<{
  title: string | undefined
  dataSource: any
  titleClass?: string
  dataSourceClass?: string
  multipleDataSource?: boolean
  dataSourceOptions?: any[]
}>(), {
  titleClass: 'col-12 col-md-6',
  dataSourceClass: 'col-12 col-md-6',
  multipleDataSource: false,
  dataSourceOptions: () => [
    { label: 'Procurements (Pengadaan)', value: 'procurements' },
    { label: 'Installations (Jasa Instalasi)', value: 'installations' },
    { label: 'Notes (Catatan PM)', value: 'notes' },
  ]
})

const emit = defineEmits(['update:title', 'update:dataSource', 'change:dataSource'])

const title = computed({
  get: () => props.title || '',
  set: (val) => emit('update:title', val)
})

const dataSource = computed({
  get: () => props.dataSource,
  set: (val) => emit('update:dataSource', val)
})

const spreadsheetUrl = computed(() => {
  const spreadsheetId = config.public.spreadsheetId
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
})
</script>