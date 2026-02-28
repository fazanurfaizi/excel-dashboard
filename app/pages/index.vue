<template>
  <q-page padding class="q-px-md q-py-sm bg-grey-2">
    <general-spinner-loading v-if="loading" />
    <q-card v-else flat style="border-radius: 8px 0px 0px 0px" class="q-pa-sm bg-transparent">
      <div class="row items-center q-mb-md q-col-gutter-md">
        <div class="col-12 col-md-6 flex items-center">
          <div class="text-h6 text-weight-bold">{{ dataModel.name }}</div>
        </div>

        <div class="col-12 col-md-6 flex justify-end items-center">
          <q-btn size="sm" icon="event" color="secondary" :label="labelYear" class="q-ma-sm">
            <q-menu cover anchor="top middle" ref="popupRef">
              <q-date minimal dense v-model="filter.year" default-view="Years" emit-immediately mask="YYYY" @update:model-value="submitYear">
                <div class="q-py-sm text-h6 text-center text-primary">{{ labelYear }}</div>                
              </q-date>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </q-card>

    <div class="dashboard-grid">
      <div v-for="(item, i) in dataModel.widgets" :key="i" class="q-mb-sm widget" :style="getGridStyle(item)">
        <q-card flat bordered class="q-px-sm q-py-md relative-position">
          <div v-if="!item.loading" class="absolute-top-right q-pa-xs row q-gutter-sm no-wrap">
            <q-btn flat round dense color="secondary" size="xs" icon="refresh" @click="fetchWidget(item)">
              <q-tooltip>Refresh Widget</q-tooltip>
            </q-btn>
          </div>
          <q-skeleton v-if="item.loading"
            :height="`${item.h * 50 + (item.title ? item.config?.title?.fontsize || 17 : 0)}px`" />
          <template v-else>
            <div v-if="item.title" class="q-px-sm dash-title ellipsis">{{ item.title }}</div>
            
            <div v-if="item.type === 'project_summary'" class="row q-gutter-sm q-px-sm q-pb-sm q-pt-xs">
              <q-select v-if="item.config?.summaryTemplate === 'monitoring'"
                :model-value="getWidgetFilterValue(item, 'pm')"
                @update:model-value="(val) => updateWidgetFilter(item, 'pm', val)" :options="picOptions" label="PIC"
                dense outlined options-dense class="col-auto" style="min-width: 150px" />
            </div>
            <div v-else class="q-pb-sm"></div>

            <div :ref="(el: any) => setWidgetRef(el, item.id)" :id="item.id" @click="handleWidgetClick"></div>
          </template>
        </q-card>
      </div>
    </div>

    <general-dialog v-model="dialog">
      <dashboard-project-detail :project="selectedProjectData" />
    </general-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { enhanceXAxisDensity, getLayout, getConfig, applyChartStyles, applyTitleStyles } from '~/utils/chartHelper'
import { useQuasar } from 'quasar'

definePageMeta({
  layout: 'dashboard'
})

const dialog = ref<any>({
  show: false,
  type: 'detail',
  title: 'kurva S',
  props: null,
  maximize: false,
  persistent: false,
})

const selectedProjectData = ref<any>(null)

const { registerPlotlyContainer } = usePlotlyAutoResize()
const $api = useApi()
const props = defineProps({
  code: { type: String, required: false },
})
const $q = useQuasar()
const { render } = useSafeHtml()

const dataModel = ref<any>({
  name: '',
  widgets: [],
})

const loading = ref(false)

const filter = ref<any>({
  year: new Date().getFullYear().toString()
})

const labelYear = computed(() => {
  return `Tahun: ${filter.value.year}`
})

const picOptions = ref<string[]>(['All'])

const chartStore = new Map<string, any>()
const widgetRefs = new Map<string, HTMLElement>()

const popupRef = ref<any>(null)

const setWidgetRef = (el: HTMLElement | null, id: string) => {
  if (!el) return
  widgetRefs.set(id, el)
  registerPlotlyContainer(el)
}

const handleWidgetClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const tr = target.closest('tr[data-row]')

  if (tr) {
    const rowDataStr = tr.getAttribute('data-row')
    if (rowDataStr) {
      try {
        const rowData = JSON.parse(decodeURIComponent(rowDataStr))

        if (rowData && (rowData.progressData || rowData.projectCode)) {
          selectedProjectData.value = rowData
          dialog.value.show = true
        }
      } catch (e) {
        console.error('Failed to parse row data from click', e)
      }
    }
  }
}

onMounted(async () => {
  loading.value = true

  if (typeof window === 'undefined') return
  if (!window.Plotly) {
    const mod = await import('plotly.js-dist-min')
    window.Plotly = mod.default
  }

  await Promise.all([fetchDashboard(), fetchPms()])
  loading.value = false

  await onRefresh()
})

const onRefresh = async () => {
  if (dataModel.value.widgets && dataModel.value.widgets.length) {
    await Promise.all(dataModel.value.widgets.map((t: any) => fetchWidget(t)))
  }
}

const getWidgetFilterValue = (item: any, filterName: string) => {
  if (!item?.config?.query?.filters) return null
  const filterParam = item.config.query.filters.find((f: any) =>
    String(f.name).toLowerCase() === filterName.toLowerCase()
  )
  return filterParam ? filterParam.value : null
}

const updateWidgetFilter = async (item: any, filterName: string, value: any) => {
  if (!item.config) item.config = {}
  if (!item.config.query) item.config.query = { filters: [] }
  if (!item.config.query.filters) item.config.query.filters = []

  const filterIndex = item.config.query.filters.findIndex((f: any) =>
    String(f.name).toLowerCase() === filterName.toLowerCase()
  )

  if (filterIndex > -1) {
    if (value === 'All') {
      item.config.query.filters.splice(filterIndex, 1)
    } else {
      item.config.query.filters[filterIndex].value = value
    }
  } else if (value !== 'All') {
    item.config.query.filters.push({ name: filterName, operator: '=', value: value })
  }

  await fetchWidget(item)
}

const getGridStyle = (item: any) => {
  return {
    gridColumn: `${item.x + 1} / span ${item.w}`,
    gridRow: `${item.y + 1} / span ${item.h}`,
  }
}

const fetchDashboard = async () => {
  await $api.get('dashboard').then((res: any) => {
    const data = res.data || res
    if (data) {
      dataModel.value = data
    }
  })
}

const fetchPms = async () => {
  await $api.get('procurements/pms').then((res: any) => {
    const data = res.data || res
    if (data) {
      picOptions.value = ['All', ...data]
    }
  })
}

const fetchWidget = async (t: any, toggleLineLabel: boolean = true) => {
  if (!t.config) t.config = {}
  if (!t.config.chartStyles) t.config.chartStyles = {}
  if (!t.config.chartStyles.lineLabels) t.config.chartStyles.lineLabels = { show: true }

  if (!t.config.query) t.config.query = { filters: [] }
  if (!t.config.query.filters) t.config.query.filters = []

  t.config.query.filters = t.config.query.filters.filter((f: any) => !f.isGlobalYear && f.name !== 'year')
  
  t.config.query.filters.push({
    name: 'year',
    operator: '=',
    value: Number(filter.value.year),
    isGlobalYear: true
  })

  const req = {
    type: t.type,
    height: t.h * 50,
    title: t.title,
    config: t.config,
  }

  if (!t.dataSource) t.dataSource = 'both'

  let dataApi: any = null
  t.loading = true
  await $api.post('widget', req).then((r: any) => dataApi = r.data || r)
  t.loading = false
  t.dataApi = dataApi
  await renderHtmlItem(t)
}

const renderHtmlItem = async (t: any) => {
  const data: any = t.dataApi
  await nextTick()
  const el = widgetRefs.get(t.id)
  if (!el || !data) return

  const titleEl = el.previousElementSibling as HTMLElement
  if (titleEl && titleEl.classList.contains('dash-title')) {
    applyTitleStyles(titleEl, t.config?.title)
  }

  if (data.html) render(el, data.html)
  if (Array.isArray(data.charts) && window.Plotly) {
    data.charts.forEach((ch: any) => chartStore.set(ch.id, ch))
    renderStoredCharts(el, data.charts.map((c: any) => c.id), $q.screen, t)
  }
}

const renderStoredCharts = (containerEl: HTMLElement, chartIds: string[], screen: any, t: any) => {
  if (!window.Plotly) return

  chartIds.forEach((id) => {
    const originalCh = chartStore.get(id)
    if (!originalCh) return

    const target: any = containerEl.querySelector(`#${id}`)

    if (!target) {
      console.error('Target element untuk Plotly benar-benar tidak ditemukan di dalam:', containerEl)
      return
    }

    const ch = JSON.parse(JSON.stringify(originalCh))

    const timeframe = ch.meta?.timeframe || t?.config?.timeframe || 'daily'
    enhanceXAxisDensity(ch, timeframe, screen)
    getLayout(ch, screen)
    getConfig(ch)

    if (t.config?.chartStyles) {
      applyChartStyles(ch, t.config.chartStyles, screen, target)
    }

    void window.Plotly.newPlot(target, ch.data, ch.layout, ch.config)
  })
}

const submitYear = async () => {
  popupRef.value?.hide()

  await onRefresh()
}
</script>

<style lang="css">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 12px;
}

.hoverable-row {
  transition: background-color 0.2s ease;
}

.hoverable-row:hover {
  background-color: #e0f2fe !important;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }

  .widget {
    grid-column: auto !important;
    grid-row: auto !important;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}
</style>