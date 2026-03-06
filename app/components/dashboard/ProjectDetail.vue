<template>
  <q-card flat class="full-width">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>
        <div class="text-weight-bold">{{ project?.projectName }}</div>
        <div class="text-caption">Kode: {{ project?.projectCode }} | Lokasi: {{ project?.location }}</div>
      </q-toolbar-title>
    </q-toolbar>

    <div class="q-pa-sm">
      <div class="row q-col-gutter-sm">       
        <div class="col-12 col-md-4 q-gutter-y-sm">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-h6 q-mb-sm text-primary">Detail Project</div>
              
              <q-list separator dense class="q-px-none">
                <q-item 
                  v-for="(item, index) in dynamicDetails" 
                  :key="index" 
                  class="q-px-xs"
                >
                  <q-item-section>
                    <q-item-label caption>{{ item.label }}</q-item-label>
                    
                    <q-item-label v-if="item.isStatus">
                      <q-chip 
                        :color="getStatusColor(String(item.value))" 
                        text-color="white" 
                        size="sm" 
                        class="text-weight-bold q-ma-none"
                      >
                        {{ item.value }}
                      </q-chip>
                    </q-item-label>

                    <q-item-label 
                      v-else 
                      :class="['text-weight-bold', item.textColor || 'text-dark']"
                    >
                      {{ item.value }}
                    </q-item-label>
                    
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-primary">Catatan PM</div>
            </q-card-section>
            
            <q-card-section class="q-pa-sm q-pt-none">
              <div v-if="isLoadingNotes" class="flex flex-center q-pa-sm">
                <q-spinner color="primary" size="2em" />
              </div>
              
              <div v-else-if="pmNotes.length === 0" class="text-grey text-italic q-pb-sm">
                Belum ada catatan untuk project ini.
              </div>
              
              <q-timeline v-else color="secondary" dense class="q-mt-none">
                <q-timeline-entry
                  v-for="note in pmNotes"
                  :key="note.id"
                  :title="formatDate(note.noteDate)"
                  class="q-mb-sm"
                >
                  <div class="text-body2 whitespace-pre-line">{{ note.notes }}</div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-8">
          <q-card flat bordered class="full-height">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-primary">Progress Pekerjaan vs Keuangan</div>
            </q-card-section>
            <q-card-section class="q-pa-sm q-pt-none">
              <div ref="chartRef" style="width: 100%; height: 400px;"></div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-primary">Detail Progress Mingguan</div>
            </q-card-section>
            
            <q-card-section class="q-pa-sm q-pt-none">
              <div v-if="progressList.length === 0" class="text-grey text-italic">
                Belum ada data progress mingguan.
              </div>
              
              <div v-else class="row q-col-gutter-sm">
                <div 
                  v-for="(item, index) in progressList" 
                  :key="index"
                  :class="dynamicColClass"
                >
                  <q-card flat bordered class="full-height hoverable-card">
                    <q-card-section class="q-pa-xs bg-grey-2 text-center">
                      <div class="text-subtitle2 text-weight-bold text-grey-8">{{ item.date }}</div>

                      <div class="row justify-between items-center q-mb-xs q-px-xs">
                        <span class="text-caption text-grey-7">Pekerjaan</span>
                        <span class="text-weight-bold text-positive">{{ item.project }}</span>
                      </div>
                      <div class="row justify-between items-center q-px-xs">
                        <span class="text-caption text-grey-7">Keuangan</span>
                        <span class="text-weight-bold text-info">{{ item.finance }}</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-card>  
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
  project: any
}>()

const emit = defineEmits(['update:modelValue'])

const $api = useApi()

let resizeObserver: ResizeObserver | null = null

const chartRef = ref<HTMLElement | null>(null)
const pmNotes = ref<any[]>([])
const isLoadingNotes = ref(false)
const installation = ref<any>(null)
const isLoadingInstallation = ref(false)

const formatDate = (dateStr: string | number | null) => {
  if (!dateStr) return 'Tanggal tidak diketahui'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? 'Tanggal tidak valid' : d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const fetchInstallation = async () => {
  if (!props.project?.projectCode) {
    installation.value = null
    return
  }

  isLoadingInstallation.value = true
  try {
    const url = `/api/installations/${props.project.projectCode}`
    
    const data = await $api.get(url)
    installation.value = data

    nextTick(() => {
      renderChart()      
    })
  } catch (error) {
    console.error('Failed to fetch installations:', error)
    installation.value = null
  } finally {
    isLoadingInstallation.value = false
  }
}

const fetchNotes = async () => {
  if (!props.project?.pm || !props.project?.projectName || !props.project?.year) {
    pmNotes.value = []
    return
  }

  isLoadingNotes.value = true
  try {
    const url = `/api/notes/project?pm=${props.project.pm}&projectName=${props.project.projectName.trim()}&year=${props.project.year}`
    const data = await $api.get(url)
    pmNotes.value = data as any[]
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    pmNotes.value = []
  } finally {
    isLoadingNotes.value = false
  }
}

const getStatusColor = (status: string) => {
  const s = (status || '').toLowerCase()
  if (s.includes('close')) return 'positive'
  if (s.includes('retensi')) return 'warning'
  return 'primary'
}

const currentProgress = computed(() => {
  if (!installation.value?.progressData) return { project: 0, finance: 0 }
  
  const dates = Object.keys(installation.value.progressData)
  let lastProject = 0, lastFinance = 0

  for (const date of dates) {
    const data = installation.value.progressData[date]
    if (data.project && !isNaN(parseFloat(data.project))) lastProject = parseFloat(data.project)
    if (data.finance && !isNaN(parseFloat(data.finance))) lastFinance = parseFloat(data.finance)
  }

  const formatValue = (val: any) => val <= 1 && val > 0 ? (val * 100).toFixed(2) : val

  return { 
    project: formatValue(lastProject), 
    finance: formatValue(lastFinance) 
  }
})

const progressList = computed(() => {
  if (!installation.value?.progressData) return []
  
  const formatCardValue = (val: any) => {
    if (val === null || val === undefined || val === '') return '-'
    const num = parseFloat(val)
    if (isNaN(num)) return val
    return num > 0 && num <= 1 ? `${(num * 100).toFixed(2)}%` : `${num}%`
  }

  return Object.entries(installation.value.progressData).map(([date, data]: [string, any]) => ({
    date,
    project: formatCardValue(data.project),
    finance: formatCardValue(data.finance)
  }))
})

const renderChart = () => {
  if (!installation.value?.progressData || !chartRef.value) return

  const rawData = installation.value.progressData

  const excludedKeys = ['Progres Terakhir/Minggu terakhir', 'Progress Minggu Kemarin']
  const dates = Object.keys(rawData).filter(key => !excludedKeys.includes(key))

  if (dates.length === 0) {
    if (typeof window !== 'undefined' && (window as any).Plotly) {
      ;(window as any).Plotly.purge(chartRef.value)
    }
    return
  }
  
  const projectData = dates.map(d => {
    const val = parseFloat(rawData[d].project)
    return isNaN(val) ? null : (val <= 1 && val > 0 ? val * 100 : val)
  })
  
  const financeData = dates.map(d => {
    const val = parseFloat(rawData[d].finance)
    return isNaN(val) ? null : (val <= 1 && val > 0 ? val * 100 : val)
  })

  const traceProject = {
    x: dates,
    y: projectData,
    name: 'Progress Project',
    type: 'bar',
    marker: { color: '#21ba45' }
  }

  const traceFinance = {
    x: dates,
    y: financeData,
    name: 'Progress Keuangan',
    type: 'bar',
    marker: { color: '#31ccec' }
  }  

  const layout = {
    autosize: true,
    barmode: 'group',
    margin: { t: 20, r: 20, l: 40, b: 60 },
    xaxis: { title: 'Tanggal', type: 'category' },
    yaxis: { title: 'Persentase (%)', range: [0, 105] },
    legend: { orientation: 'h', y: -0.2 }
  }

  if (typeof window !== 'undefined' && (window as any).Plotly) {
    ;(window as any).Plotly.newPlot(chartRef.value, [traceProject, traceFinance], layout, { responsive: true })
    
    if (resizeObserver) resizeObserver.disconnect()
    
    resizeObserver = new ResizeObserver(() => {
      if (chartRef.value && (window as any).Plotly) {
        (window as any).Plotly.Plots.resize(chartRef.value)
      }
    })
    resizeObserver.observe(chartRef.value)
  }
}

const dynamicDetails = computed(() => {
  if (!installation.value) return []

  const details = []
  
  details.push({ label: 'Kapasitas', value: `${installation.value.capacity || 0} ${installation.value.unit || ''}`.trim() })

  details.push({ label: 'Status', value: installation.value.status || 'On Progress', isStatus: true })
  
  const bastRetDate = installation.value.bast_and_retention_date || installation.value.bastAndRetentionDate || installation.value.note || '-'
  details.push({ label: 'BAST & Retention Date', value: bastRetDate })
    
  details.push({ label: 'EPC', value: installation.value.epc || '-' })
  
  details.push({ label: 'Developer', value: installation.value.developer || '-' })
    
  details.push({ label: 'Progress Pekerjaan', value: `${currentProgress.value.project}%`, textColor: 'text-positive' })
  
  details.push({ label: 'Progress Keuangan', value: `${currentProgress.value.finance}%`, textColor: 'text-info' })
    
  const actualOh = installation.value.actual_oh || installation.value.actualOh || installation.value.weeklyMeeting || '-'
  details.push({ label: 'Actual OH', value: actualOh })
    
  details.push({ label: 'PM', value: installation.value.pm || '-' })
  
  // const excludeKeys = [
  //   'capacity', 'unit', 'status', 'note', 'weeklyMeeting', 
  //   'progressData', 'projectName', 'projectCode', 'location', 'id',
  //   'bast_and_retention_date', 'bastAndRetentionDate', 'epc', 'developer',
  //   'actual_oh', 'actualOh', 'pm'
  // ]
  
  // for (const [key, val] of Object.entries(installation.value)) {
  //   if (!excludeKeys.includes(key) && val !== null && val !== '' && typeof val !== 'object') {    
  //     const formattedLabel = key
  //       .replace(/_/g, ' ')
  //       .replace(/([A-Z])/g, ' $1')
  //       .replace(/^./, str => str.toUpperCase())
  //       .trim()

  //     details.push({ label: formattedLabel, value: val })
  //   }
  // }

  return details
})

const dynamicColClass = computed(() => {
  const total = progressList.value.length    
  if (total === 1) return 'col-12 col-sm-12'    
  if (total === 2) return 'col-12 col-sm-6'    
  if (total === 3) return 'col-12 col-sm-4'    
  if (total === 4) return 'col-12 col-sm-6 col-md-3'    
  return 'col-12 col-sm-4 col-md-3 col-lg-2'
})

onMounted(() => {  
  fetchInstallation()
  fetchNotes()
  nextTick(() => {
    renderChart()
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.project, () => {  
  fetchInstallation()
  fetchNotes()
  nextTick(() => {
    renderChart()
  })
}, { deep: true })

watch(() => installation.value, () => {
  nextTick(() => {
    renderChart()
  })
}, { deep: true })
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}
</style>