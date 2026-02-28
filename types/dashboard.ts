export enum WidgetType {
  BAR = 'BAR',
  LINE = 'LINE',
  AREA = 'AREA',
  PIE = 'PIE',
  DONUT = 'DONUT',
  SCATTER = 'SCATTER',
  BUBBLE = 'BUBBLE',
  HEATMAP = 'HEATMAP',
  GEO = 'GEO',
  INDICATOR = 'INDICATOR',
  TABLE = 'TABLE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  IFRAME = 'IFRAME',
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  WATERFALL = 'WATERFALL',
  SPARKLINE = 'SPARKLINE'
}

export enum ComparisonOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH'
}

export type ChartTimeframe = 'daily' | 'monthly' | 'yearly' | null | undefined
export type AdditionalAxisType = 'line' | 'area' | 'stack' | 'group'

export type DataValue = string | number | boolean | Date | null | undefined
export type DataRow = Record<string, DataValue>

export type SumamryTemplate = 'monitoring' | 'executive' | null | undefined

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface WidgetStyle {
  colSpan?: number
  rowSpan?: number
  height?: number
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  textAlign?: 'left' | 'center' | 'right'
  padding?: string
  border?: string
  borderRadius?: string
}

export interface ChartStyle {
  colorPalette?: string[]
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showTooltip?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  isStacked?: boolean
  fillArea?: boolean
  holeSize?: number
  lineShape?: 'linear' | 'spline' | 'hv' | 'vh' | 'hvh' | 'vhv'
  lineWidth?: number
  showMarkers?: boolean
  markerSize?: number
  connectorLineColor?: string
  increasingColor?: string
  decreasingColor?: string
  totalColor?: string
  sparklineType?: 'line' | 'bar' | 'area'
}

export interface FilterConfig {
  column: string
  operator: ComparisonOperator
  value: string | number | boolean | null
}

export interface SortConfig {
  column: string
  direction: SortDirection
}

export interface ChartConfig {
  title?: string
  type: WidgetType
  dataSource: string // Sheet ID or table name
  query?: string // SQL query or similar

  // Data Mapping
  dimensions: string[] // X-axis, Categories
  metrics: string[] // Y-axis, Values

  // Advanced mapping
  breakdown?: string // Color/Group by
  secondAxis?: string // Secondary metric for combo charts
  secondAxisType?: 'bar' | 'line' // Type of the secondary axis chart

  // Waterfall specific
  measureColumn?: string // Column defining 'relative', 'total', etc.

  filters?: FilterConfig[]
  sort?: SortConfig[]
  limit?: number

  styles?: ChartStyle
}

export interface AdditionalAxisConfig {
  type: AdditionalAxisType
  name: string
  color?: string
  show?: boolean
  lineDash?: string
}

export interface ColorSeries {
  code: string
  color: string
  child?: string
}

export interface ChartStyleConfig {
  xaxis?: { show?: boolean; fontsize?: number }
  yaxis?: { show?: boolean; fontsize?: number }
  y2axis?: { show?: boolean; fontsize?: number }
  legend?: { show?: boolean; position?: 'top' | 'bottom' | 'right' | 'left'; fontsize?: number }
  labels?: { show?: boolean; fontsize?: number; position?: 'auto' | 'inside' | 'outside' }
  lineLabels?: { show?: boolean; fontsize?: number }
  options?: {
    barMode?: 'group' | 'stack' | 'relative' | 'overlay'
    lineDash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot'
  }
}

export interface TitleConfig {
  align?: 'left' | 'center' | 'right',
  fontsize?: number
}

export interface FilterItem {
  name: string | number | null
  operator: string | number | null
  value: string | number | null
}

export interface ColumnConfig {
  id?: string
  name: string
  label?: string
  format?: 'number' | 'date' | 'datetime' | 'string'
  precision?: number | null
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | null
  datefilter?: boolean
}

export interface WidgetData {
  id?: string
  type: string
  title: string
  config: {
    dataSource?: string[] | null
    query: {
      limit: number
      order: string
      applyFilterExactDateEnd?: boolean | null
      filters: FilterItem[]
    }
    columns: ColumnConfig[]
    chart: {
      type: 'scatter' | 'line' | 'column' | 'bar' | 'area' | 'pie'
      x: string | null
      series: {
        field: string
        name?: string
        axis: 'y' | 'y2'
        type: 'auto' | 'scatter' | 'line' | 'column' | 'area' | 'pie'
        mode?: 'lines' | 'markers' | 'text' | 'lines+markers' | 'lines+text' | 'markers+text' | 'lines+markers+text'
        fill?: 'none' | 'tozeroy' | 'tonexty'
      }[]
      legend: string | null
      options?: {
        layout?: Record<string, unknown>
        config?: Record<string, unknown>
      }
    }
    summaryTemplate?: SumamryTemplate
    colorSeries?: ColorSeries[]
    shows?: string[]
    timeframe?: ChartTimeframe
    timeframeDefaultValue?: number | null
    chartStyles?: ChartStyleConfig
    showLineLabel?: boolean | null
    title?: TitleConfig | null | undefined
  }
  x?: number
  y?: number
  w?: number
  h?: number
}

export interface PlotlyTrace {
  type?: string
  mode?: string
  name?: string
  x?: DataValue[]
  y?: DataValue[]
  labels?: DataValue[]
  values?: DataValue[]
  yaxis?: string
  fill?: string
  orientation?: string
  opacity?: number
}

export interface WidgetRenderResult {
  html: string
  charts: {
    id: string
    data: PlotlyTrace[]
    layout: Record<string, unknown>
    config: Record<string, unknown>
  }[]
}


export interface Dashboard {
  id: number | null
  name: string | null
  code: string | null
  widgets?: WidgetData[]
}