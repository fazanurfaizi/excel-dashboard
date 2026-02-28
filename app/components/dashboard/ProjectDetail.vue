<template>
  <q-card flat>
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>
        <div class="text-weight-bold">{{ project?.projectName }}</div>
        <div class="text-caption">Kode: {{ project?.projectCode }} | Lokasi: {{ project?.location }}</div>
      </q-toolbar-title>
    </q-toolbar>

    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md">
        
        <div class="col-12 col-md-4">
          <q-card flat bordered class="h-full">
            <q-card-section>
              <div class="text-h6 q-mb-md text-primary">Detail Project</div>
              
              <q-list separator dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Kapasitas</q-item-label>
                    <q-item-label class="text-weight-bold">{{ project?.capacity }} {{ project?.unit }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status</q-item-label>
                    <q-item-label>
                      <q-chip :color="getStatusColor(project?.status)" text-color="white" size="sm" class="text-weight-bold q-ma-none">
                        {{ project?.status || 'On Progress' }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="project?.status === 'Retens'">
                  <q-item-section>
                    <q-item-label caption>Tanggal Retensi</q-item-label>
                    <q-item-label class="text-negative text-weight-bold">{{ project?.note || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Realisasi OH</q-item-label>
                    <q-item-label class="text-weight-bold">{{ project?.weeklyMeeting || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Progress Pekerjaan</q-item-label>
                    <q-item-label class="text-weight-bold text-positive">{{ currentProgress.project }}%</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Progress Keuangan</q-item-label>
                    <q-item-label class="text-weight-bold text-info">{{ currentProgress.finance }}%</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-primary">Kurva S (Progress Pekerjaan vs Keuangan)</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div ref="chartRef" style="width: 100%; height: 400px;"></div>
            </q-card-section>
          </q-card>
        </div>

      </div>
    </q-card-section>
  </q-card>  
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
  project: any
}>()

const emit = defineEmits(['update:modelValue'])

const chartRef = ref<HTMLElement | null>(null)

const getStatusColor = (status: string) => {
  const s = (status || '').toLowerCase()
  if (s.includes('close')) return 'positive'
  if (s.includes('retensi')) return 'warning'
  return 'primary'
}

const currentProgress = computed(() => {
  if (!props.project?.progressData) return { project: 0, finance: 0 }
  
  const dates = Object.keys(props.project.progressData)
  let lastProject = 0, lastFinance = 0

  for (const date of dates) {
    const data = props.project.progressData[date]
    if (data.project && !isNaN(parseFloat(data.project))) lastProject = parseFloat(data.project)
    if (data.finance && !isNaN(parseFloat(data.finance))) lastFinance = parseFloat(data.finance)
  }

  const formatValue = (val: any) => val < 1 && val > 0 ? (val * 100).toFixed(2) : val

  return { 
    project: formatValue(lastProject), 
    finance: formatValue(lastFinance) 
  }
})

const renderChart = () => {

  if (!props.project?.progressData || !chartRef.value) return

  const rawData = props.project.progressData
  const dates = Object.keys(rawData)
  
  const projectData = dates.map(d => {
    const val = parseFloat(rawData[d].project)
    return isNaN(val) ? null : (val < 1 && val > 0 ? val * 100 : val)
  })
  
  const financeData = dates.map(d => {
    const val = parseFloat(rawData[d].finance)
    return isNaN(val) ? null : (val < 1 && val > 0 ? val * 100 : val)
  })

  const traceProject = {
    x: dates,
    y: projectData,
    name: 'Progress Project',
    type: 'scatter',
    mode: 'lines+markers',
    line: { shape: 'spline', color: '#21ba45', width: 3 },
    connectgaps: true
  }

  const traceFinance = {
    x: dates,
    y: financeData,
    name: 'Progress Keuangan',
    type: 'scatter',
    mode: 'lines+markers',
    line: { shape: 'spline', color: '#31ccec', width: 3, dash: 'dot' },
    connectgaps: true
  }

  const layout = {
    autosize: true,
    margin: { t: 20, r: 20, l: 40, b: 60 },
    xaxis: { title: 'Tanggal' },
    yaxis: { title: 'Persentase (%)', range: [0, 105] },
    legend: { orientation: 'h', y: -0.2 }
  }

  if (typeof window !== 'undefined' && (window as any).Plotly) {
    ;(window as any).Plotly.newPlot(chartRef.value, [traceProject, traceFinance], layout, { responsive: true })
  }
}

onMounted(() => {
  nextTick(() => {
    renderChart()
  })
})

watch(() => props.project, () => {
  nextTick(() => {
    renderChart()
  })
}, { deep: true })
</script>