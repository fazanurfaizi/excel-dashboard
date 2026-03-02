import { DataRow, WidgetData, WidgetRenderResult } from "~~/types/dashboard"

export function renderProjectSummaryWidget(
    rows: DataRow[],
    config: WidgetData['config'],
    height?: number
): WidgetRenderResult {
    const templateType = config.summaryTemplate === 'monitoring' ? 'monitoring' : 'executive'

    let procurementCount = 0
    let installationCount = 0
    let totalCapacity = 0
    const statusCounts: Record<string, number> = {
        'On Going': 0,
        'Close': 0,
        'Menunggu TTD BAST': 0,
        'Retensi': 0
    }

    const breakdownAgg: Record<string, Record<string, Record<string, number>>> = {}

    // Process the raw rows
    rows.forEach(row => {
        if (row['procurements.id']) procurementCount++;

        if (row['installations.id']) {
            installationCount++;

            const cap = Number(row['installations.capacity']);
            if (!isNaN(cap)) totalCapacity += cap;

            const status = String(row['installations.status'] || '').trim();
            const pic = String(row['installations.pm'] || '-').trim();
            const year = String(row['installations.year'] || '-').trim();

            if (status) {
                const matchedKey = Object.keys(statusCounts).find(k => k.toLowerCase() === status.toLowerCase());
                const finalStatusKey = matchedKey || status;
                
                if (matchedKey && statusCounts[matchedKey] !== undefined) { 
                    statusCounts[matchedKey]++;
                } else if (status !== 'undefined' && status !== 'null') {
                    statusCounts[finalStatusKey] = (statusCounts[finalStatusKey] || 0) + 1;
                }

                // Masukkan data ke Aggregation
                if (finalStatusKey !== 'undefined' && finalStatusKey !== 'null') {
                    if (!breakdownAgg[finalStatusKey]) breakdownAgg[finalStatusKey] = {};
                    if (!breakdownAgg[finalStatusKey][pic]) breakdownAgg[finalStatusKey][pic] = {};
                    breakdownAgg[finalStatusKey][pic][year] = (breakdownAgg[finalStatusKey][pic][year] || 0) + 1;
                }
            }
        }
    });

    const totalProjects = procurementCount + installationCount;

    const encodeBreakdown = (statusKey: string) => {
        const data = breakdownAgg[statusKey] || {};
        const result: { pic: string, year: string, count: number }[] = [];
        
        for (const pic of Object.keys(data)) {
            if (data[pic]) {
                for (const year of Object.keys(data[pic])) {
                    result.push({ pic, year, count: data[pic][year]! });
                }
            }
        }
        // Urutkan berdasarkan Tahun (descending), lalu Count (descending)
        result.sort((a, b) => b.year.localeCompare(a.year) || b.count - a.count);
        return encodeURIComponent(JSON.stringify(result));
    }

    let html = `<div class="q-pa-md bg-grey-1 rounded-borders" style="font-family: sans-serif;" style="min-height: ${height}px !important; max-height: ${height}px !important;">`;

    if (templateType === 'monitoring') {
        html += `
        <div class="bg-white shadow-1 rounded-borders q-pa-lg q-mb-md text-center">
            <div class="text-subtitle1 text-grey-8 text-weight-medium q-mb-sm text-uppercase">Jumlah Project</div>
            <div class="text-h2 text-weight-bolder text-primary">${totalProjects}</div>
        </div>
        `;
    } else {
        html += `
        <div class="row q-col-gutter-md q-mb-md">    
            <div class="col-6">
                <div class="bg-white shadow-1 rounded-borders q-pa-sm text-center full-height flex flex-center column">
                    <div class="text-caption text-grey-8 text-weight-bold text-uppercase q-mb-xs">Project Pengadaan</div>
                    <div class="text-h5 text-weight-bolder text-secondary">${procurementCount}</div>
                </div>
            </div>

            <div class="col-6">
                <div class="bg-white shadow-1 rounded-borders q-pa-sm text-center full-height flex flex-center column">
                    <div class="text-caption text-grey-8 text-weight-bold text-uppercase q-mb-xs">Project Pemasangan</div>
                    <div class="text-h5 text-weight-bolder text-secondary">${installationCount}</div>
                </div>
            </div>
        </div>

        <div class="bg-primary text-white shadow-1 rounded-borders q-pa-md q-mb-md text-center">
            <div class="text-subtitle2 text-weight-medium text-uppercase q-mb-sm" style="opacity: 0.9">Kapasitas PLTS Terpasang</div>
            <div class="row justify-center items-baseline">
                <div class="text-h3 text-weight-bolder q-mr-sm">${totalCapacity.toLocaleString('en-US')}</div>
                <div class="text-subtitle1 text-weight-medium">KWP</div>
            </div>
        </div>
        `;
    }
    
    html += `
        <div class="bg-white shadow-1 rounded-borders q-pa-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-md text-center text-uppercase">Status Project</div>
            <div class="row q-col-gutter-sm text-center">
                <div class="col-6">
                    <div class="bg-grey-2 rounded-borders q-pa-sm full-height cursor-pointer hoverable-card" data-status-summary="${encodeBreakdown('On Going')}" data-status-name="On Going">
                        <div class="text-caption text-grey-8 q-mb-xs">Ongoing</div>
                        <div class="text-h6 text-weight-bold text-primary">${statusCounts['On Going'] || 0}</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="bg-grey-2 rounded-borders q-pa-sm full-height cursor-pointer hoverable-card" data-status-summary="${encodeBreakdown('Close')}" data-status-name="Close">
                        <div class="text-caption text-grey-8 q-mb-xs">Closed</div>
                        <div class="text-h6 text-weight-bold text-positive">${statusCounts['Close'] || 0}</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="bg-grey-2 rounded-borders q-pa-sm full-height cursor-pointer hoverable-card" data-status-summary="${encodeBreakdown('Menunggu TTD BAST')}" data-status-name="Menunggu BAST">
                        <div class="text-caption text-grey-8 q-mb-xs" style="line-height: 1.2">Menunggu BAST</div>
                        <div class="text-h6 text-weight-bold text-warning">${statusCounts['Menunggu TTD BAST'] || 0}</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="bg-grey-2 rounded-borders q-pa-sm full-height cursor-pointer hoverable-card" data-status-summary="${encodeBreakdown('Retensi')}" data-status-name="Retensi">
                        <div class="text-caption text-grey-8 q-mb-xs">Retensi</div>
                        <div class="text-h6 text-weight-bold text-info">${statusCounts['Retensi'] || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    return { html, charts: [] };
}