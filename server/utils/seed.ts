import type { Db, Tx } from '~~/server/utils/db'
import { procurements, installations, notes } from '~~/server/database/schema'
import { and, eq, or } from 'drizzle-orm'

export async function syncProcurementData(db: Db, rawData: any[][], year: number) {
  // Structure Mapping:
  // Index 0-2 (Rows 1-3): Empty
  // Index 3   (Row 4):    Header 1 (Dates: 01/12/2025...)
  // Index 4   (Row 5):    Header 2 (Sub-headers: Progress/Pengeluaran...)
  // Index 5+  (Row 6+):   Data Rows

  if (rawData.length < 6) return

  const headerRow1 = rawData[3] || []
  const headerRow2 = rawData[4] || []
  const dataRows = rawData.slice(5)

  if (headerRow1.length > 0) {
    const findColIndex = (keywords: string[]) => {
      for (let i = 0; i < headerRow1.length; i++) {
        const val1 = String(headerRow1[i] || '').toLowerCase().trim()
        const val2 = String(headerRow2[i] || '').toLowerCase().trim()
        if (keywords.some(k => val1.includes(k) || val2.includes(k))) {
          return i
        }
      }
      return -1
    }

    const colIdx = {
      status: findColIndex(['status']),
      no: findColIndex(['no', 'nomor']),
      projectCode: findColIndex(['kode project', 'kode projek', 'kode proyek', 'project code']),
      projectName: findColIndex(['nama project', 'nama projet', 'project name']),
      location: findColIndex(['lokasi project', 'lokasi', 'location']),
      pm: findColIndex(['pm']),
      admin: findColIndex(['admin']),
      epc: findColIndex(['epc']),   
    }

    const foundIndices = Object.values(colIdx).filter(idx => idx !== -1)
    const maxStaticIndex = foundIndices.length > 0 ? Math.max(...foundIndices) : 16
    const dynamicStartIndex = maxStaticIndex + 1

    const records: any[] = []

    const getCell = (row: any[], index: number, fallback: any = null) => {
      return index !== -1 && row[index] !== undefined && row[index] !== null ? row[index] : fallback
    }

    for (const row of dataRows) {      
      const isStatusEmpty = !getCell(row, colIdx.status)
      const isNameEmpty = !getCell(row, colIdx.projectName)
      const isPmEmpty = !getCell(row, colIdx.pm)    
      
      if (isStatusEmpty && isNameEmpty && isPmEmpty) continue

      const staticData = {
        year: year,
        status: getCell(row, colIdx.status),
        no: parseInt(getCell(row, colIdx.no)) || 0,
        projectCode: getCell(row, colIdx.projectCode),
        projectName: getCell(row, colIdx.projectName),
        location: getCell(row, colIdx.location),
        pm: getCell(row, colIdx.pm),
        admin: getCell(row, colIdx.admin),
        epc: getCell(row, colIdx.epc),
      }

      if(staticData.projectName) {
        const financeData: Record<string, any> = {}

        if (dynamicStartIndex > 0) {
          for (let i = dynamicStartIndex; i < row.length; i++) {
            const subCategory = headerRow2[i]
            
            if (!subCategory) continue

            const cellValue = row[i]
            const subCatStr = subCategory.toString().toLowerCase()
            
            // Explicitly check for both so we don't accidentally grab garbage data
            if (subCatStr.includes('pengeluaran')) {
              financeData['expense'] = cellValue
            } else if (subCatStr.includes('progress')) {
              financeData['progress'] = cellValue
            }
          }
        }         

        records.push({
          ...staticData,
          financeData: financeData
        })
      }
    }

    if (records.length === 0) return

    await db.delete(procurements).where(eq(procurements.year, year)).run()
    
    const CHUNK_SIZE = 8;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      await db.insert(procurements).values(chunk).run();
    }
  }
}

export async function syncInstallationData(db: Db, rawData: any[][], year: number) {
  // Structure Mapping:
  // Index 0-2 (Rows 1-3): Empty
  // Index 3   (Row 4):    Header 1 (Dates: 01/12/2025...)
  // Index 4   (Row 5):    Header 2 (Sub-headers: Project/Keuangan...)
  // Index 5+  (Row 6+):   Data Rows

  if (rawData.length < 6) return

  const headerRow1 = rawData[3] || []
  const headerRow2 = rawData[4] || []
  const dataRows = rawData.slice(5)

  if (headerRow1.length > 0) {

    const findColIndex = (keywords: string[]) => {
      for (let i = 0; i < headerRow1.length; i++) {
        const val1 = String(headerRow1[i] || '').toLowerCase().trim()
        const val2 = String(headerRow2[i] || '').toLowerCase().trim()
        if (keywords.some(k => val1.includes(k) || val2.includes(k))) {
          return i
        }
      }
      return -1
    }

    const colIdx = {
      status: findColIndex(['status']),
      no: findColIndex(['no', 'nomor']),
      bastRetensi: findColIndex(['bast & retensi', 'retensi']),
      bastDoc: findColIndex(['dokumen bast', 'dokumen']),
      projectCode: findColIndex(['kode project', 'kode projek', 'kode proyek', 'project code']),
      projectName: findColIndex(['nama project', 'project name']),
      location: findColIndex(['lokasi', 'location']),
      capacity: findColIndex(['kapasitas', 'capacity']),
      unit: findColIndex(['satuan', 'unit']),
      pm: findColIndex(['pm']),
      admin: findColIndex(['admin']),
      sm: findColIndex(['sm', 'site manager']),
      actualOh: findColIndex(['realisasi', 'actual']),
      manpower: findColIndex(['update mp', 'manpower']),
      epc: findColIndex(['epc']),
      developer: findColIndex(['developer']),
      roofType: findColIndex(['type atap', 'tipe atap', 'atap'])
    }

    const foundIndices = Object.values(colIdx).filter(idx => idx !== -1)
    const maxStaticIndex = foundIndices.length > 0 ? Math.max(...foundIndices) : 16
    const dynamicStartIndex = maxStaticIndex + 1

    const records: any[] = []

    const getCell = (row: any[], index: number, fallback: any = null) => {
      return index !== -1 && row[index] !== undefined && row[index] !== null ? row[index] : fallback
    }

    for (const row of dataRows) {      
      const isStatusEmpty = !getCell(row, colIdx.status)
      const isNameEmpty = !getCell(row, colIdx.projectName)
      const isPmEmpty = !getCell(row, colIdx.pm)
      if (isStatusEmpty && isNameEmpty && isPmEmpty) continue

      const staticData = {
        year: year,
        status: getCell(row, colIdx.status),
        no: parseInt(getCell(row, colIdx.no)) || 0,
        bastAndRetentionDate: parseTextDate(getCell(row, colIdx.bastRetensi)),
        bastDocumentDate: parseTextDate(getCell(row, colIdx.bastDoc)),
        projectCode: getCell(row, colIdx.projectCode),
        projectName: getCell(row, colIdx.projectName),
        location: getCell(row, colIdx.location),
        capacity: parseFloat(getCell(row, colIdx.capacity)) || 0,
        unit: getCell(row, colIdx.unit),
        pm: getCell(row, colIdx.pm),
        admin: getCell(row, colIdx.admin),
        sm: getCell(row, colIdx.sm),
        actual_oh: getCell(row, colIdx.actualOh),
        manpowerUpdate: getCell(row, colIdx.manpower),
        epc: getCell(row, colIdx.epc),
        developer: getCell(row, colIdx.developer),
        roofType: getCell(row, colIdx.roofType),
      }

      const progressData: Record<string, any> = {}

      let currentDateKey = ''

      if (dynamicStartIndex > 0) {
        for (let i = dynamicStartIndex; i < row.length; i++) {
          if (headerRow1[i]) {
            const rawHeader = headerRow1[i]
            if (rawHeader instanceof Date) {
              const y = rawHeader.getFullYear()
              const m = String(rawHeader.getMonth() + 1).padStart(2, '0')
              const d = String(rawHeader.getDate()).padStart(2, '0')
              currentDateKey = `${y}-${m}-${d}`
            } else {
              currentDateKey = String(rawHeader).trim()
            }

            if (!progressData[currentDateKey]) progressData[currentDateKey] = {}
          }

          // (Project vs Keuangan)
          const subCategory = headerRow2[i]
          const cellValue = row[i]

          if (currentDateKey && subCategory) {
            const key = subCategory.toString().toLowerCase().includes('keuangan') ? 'finance' : 'project'
            progressData[currentDateKey][key] = cellValue
          }
        }
      }

      records.push({
        ...staticData,
        progressData: progressData
      })
    }

    if (records.length === 0) return

    await db.delete(installations).where(eq(installations.year, year)).run()
    const CHUNK_SIZE = 4;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      await db.insert(installations).values(chunk).run();
    }
  }
}

export async function syncNotesData(db: Db, rawData: any[], currentYear: string) {
  if (!rawData || rawData.length === 0) {
    console.log('No data found in "Update To Do PM" sheet.');
    return;
  }

  const records: any[] = [];
  const isFirstRowHeader = rawData[0] && rawData[0].__EMPTY_1 === 'PM' && rawData[0].__EMPTY_2 === 'Nama Proyek';
  const startIndex = isFirstRowHeader ? 1 : 0;

  let lastSeenPm = 'Unknown';
  let lastSeenYear = currentYear;
  let lastSeenDate: Date | null = null;

  for (let i = startIndex; i < rawData.length; i++) {
    const row = rawData[i];

    const rawDate = row.__EMPTY;
    const pm = row.__EMPTY_1;
    const projectName = row.__EMPTY_2;
    const noteText = row.__EMPTY_3;
    const yearValue = row.__EMPTY_4;

    let noteDateObj: Date | null = null;
    if (rawDate) {
      let tempDate: Date | null = null;

      if (rawDate instanceof Date) {
        tempDate = rawDate;
      } else if (typeof rawDate === 'string') {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          tempDate = parsedDate;
        }
      }

      if (tempDate) {
        const userTimezoneOffset = tempDate.getTimezoneOffset() * 60000;
        noteDateObj = new Date(tempDate.getTime() - userTimezoneOffset);

        lastSeenDate = noteDateObj;
      }
    }
    if (!noteDateObj && lastSeenDate) {
      noteDateObj = lastSeenDate;
    }

    let currentPmValue = pm ? pm.toString().trim() : null;
    if (currentPmValue) {
      lastSeenPm = currentPmValue;
    } else {
      currentPmValue = lastSeenPm;
    }

    let noteYear: string;
    if (yearValue) {
      const parsedYear = yearValue.toString()
      if (!isNaN(parsedYear)) {
        lastSeenYear = parsedYear;
        noteYear = lastSeenYear;
      } else {
        noteYear = lastSeenYear;
      }
    } else {
      noteYear = lastSeenYear;
    }

    const cleanProjectName = projectName ? projectName.toString().trim() : null;
    const cleanNoteText = noteText ? noteText.toString().trim() : null;

    if (cleanProjectName || cleanNoteText) {
      records.push({
        noteDate: noteDateObj,
        pm: currentPmValue,
        project_name: cleanProjectName,
        notes: cleanNoteText,
        year: noteYear,
        syncedAt: new Date()
      });
    }
  }

  if (records.length === 0) return

  const uniqueCombos = Array.from(new Set(records.map(r => `${r.pm}|${r.project_name}|${r.year}`)));

  const deleteConditions = uniqueCombos.map(combo => {
    const [p_pm, p_name, p_year] = combo.split('|');
    
    return and(
      eq(notes.pm, p_pm || ''),
      eq(notes.project_name, p_name || ''),
      eq(notes.year, parseInt(p_year || '0'))
    );
  });

  if (deleteConditions.length > 0) {
    await db.delete(notes)
      .where(or(...deleteConditions))
      .run();
    }

  const INSERT_CHUNK_SIZE = 15;
  for (let i = 0; i < records.length; i += INSERT_CHUNK_SIZE) {
    const chunk = records.slice(i, i + INSERT_CHUNK_SIZE);
    await db.insert(notes).values(chunk).run();
  }
}

function parseTextDate(value: any): string | null {
  if (value === undefined || value === null || value === '') return null;

  if (value instanceof Date) {
    const d = String(value.getDate()).padStart(2, '0');
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const y = value.getFullYear();
    return `${d}/${m}/${y}`;
  }
  
  return String(value).trim();
}