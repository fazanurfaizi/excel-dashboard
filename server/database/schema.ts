import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import type { WidgetData } from '~~/types/dashboard'

export const dashboards = sqliteTable('dashboards', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    code: text('code').unique(),
    widgets: text('widgets', { mode: 'json' }).$type<WidgetData[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const procurements = sqliteTable('procurements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    year: integer('year').notNull(),
    status: text('status'),
    no: integer('no'),
    projectCode: text('project_code'),
    projectName: text('project_name'),
    location: text('location'),
    pm: text('pm'),
    admin: text('admin'),
    epc: text('epc'),
    notes: text('notes'),
    syncedAt: integer('synced_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const installations = sqliteTable('installations', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    year: integer('year').notNull(),
    status: text('status'),
    no: integer('no'),
    note: text('note'),
    weeklyMeeting: text('weekly_meeting'),
    projectCode: text('project_code'),
    projectName: text('project_name'),
    location: text('location'),
    capacity: real('capacity'),
    unit: text('unit'),
    pm: text('pm'),
    admin: text('admin'),
    sm: text('sm'),
    manpowerUpdate: integer('manpower_update'),
    epc: text('epc'),
    developer: text('developer'),
    roofType: text('roof_type'),
    progressData: text('progress_data', { mode: 'json' }).$type<Record<string, { project?: string, finance?: string }>>(),
    syncedAt: integer('synced_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})