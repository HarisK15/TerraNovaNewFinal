// todo: could add fallback UI or logging for failed exports
// this file processes data according to the export templates
import * as XLSX from 'xlsx';
import { applyTemplate } from './exportTemplates';
// import moment from 'moment'; 
// import { saveAs } from 'file-saver';



const debug = true; // set to false before pushing



export const processStuff = (templateId, data, columns, config = {}) => {
  console.log('Processing:', templateId);
  // console.log('Data sample:', data.slice(0, 2));
  const { category, type } = config;
  
  // Statistical Summary - calculate statistics for numeric columns
  if (category === 'analysis' && templateId === 'analysis-statistical-summary') {
    let num_cols = find_numeric_cols(data, columns);
    console.log('Found columns->', num_cols);
    
    let summaryData = [
      ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
    ];
    
    for (let col of num_cols) {
      let values = getNumVals(data, col);
      let stats = calcStats(values);
      if (stats) {
        summaryData.push([
          col,
          stats.count,
          stats.min,
          stats.max,
          stats.sum,
          stats.avg,
          stats.stdDev
        ]);
        // console.log('Sum for' + col + 'in statistical summary' + stats.sum);
      }
    }
    
    return { summaryData };
  }
  
  // Category Analysis - group by category and calculate sums/averages
  else if (category === 'analysis' && templateId === 'analysis-category-grouping') {
    let categoryCol = findColByPattern(columns, ['category', 'type', 'group']);
    if (categoryCol) {
      console.log(' found column for categories:', categoryCol);
      let numericColumns = find_numeric_cols(data, columns);
      let cats = getUniq(data.map(r => r[categoryCol]));
      
      let catData = [
        ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                             ...numericColumns.map(col => `Average ${col}`)]
      ];
      
      for (let cat of cats) {
        let catRows = data.filter(row => row[categoryCol] === cat);
        let count = catRows.length;
        let row = [cat, count];
        
        numericColumns.forEach(col => {
          const values = getNumVals(catRows, col);
          const sum = values.reduce((a, b) => a + b, 0);
          row.push(sum);
        });
        
        numericColumns.forEach(col => {
          const values = getNumVals(catRows, col);
          const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          row.push(avg);
        });
        
        catData.push(row);
      }
      
      const catSheet = XLSX.utils.aoa_to_sheet(catData);
      /* eslint-disable no-undef */
      if (typeof window._workbook === 'undefined') {
        window._workbook = XLSX.utils.book_new();
      }
      XLSX.utils.book_append_sheet(window._workbook, catSheet, 'Category Analysis');
      return { catData };
    }
  }
  
  else if (category === 'financial' && templateId === 'finance-quarterly-report') {
    // Find relevant columns
    let dateCol = findColByPattern(columns, ['date', 'period', 'quarter']);
    let amountCol = findColByPattern(columns, ['amount', 'value', 'total', 'sum', 'revenue', 'expense']);
    let typeCol = findColByPattern(columns, ['type', 'category', 'segment', 'class']);
    
    if (dateCol && amountCol && typeCol) {
      let periods = getUniq(data.map(r => r[dateCol]));
      let types = getUniq(data.map(r => r[typeCol]));
      
      let periodData = [
        ['Period', ...types, 'Total']
      ];
      
      for (let period of periods) {
        let periodRows = data.filter(row => row[dateCol] === period);
        let row = [period];
        let periodTotal = 0;
        
        for (let type of types) {
          let typeRows = periodRows.filter(row => row[typeCol] === type);
          const typeValues = typeRows.map(row => {
            const val = row[amountCol];
            return typeof val === 'number' ? val : 
                  (typeof val === 'string' && !isNaN(parseFloat(val)) ? parseFloat(val) : 0);
          });
          
          const typeTotal = typeValues.reduce((a, b) => a + b, 0);
          row.push(typeTotal);
          periodTotal += typeTotal;
        }
        row.push(periodTotal);
        periodData.push(row);
      }
      
      let totalsRow = ['Total'];
      let grandTotal = 0;
      
      for (let i = 0; i < types.length; i++) {
        let typeTotal = 0;
        for (let j = 1; j < periodData.length; j++) {
          typeTotal += periodData[j][i + 1] || 0;
        }
        totalsRow.push(typeTotal);
        grandTotal += typeTotal;
      }
      
      totalsRow.push(grandTotal);
      periodData.push(totalsRow);
      
      return { periodData };
    }
  }
  
  console.log('Nothing available');
  return null;
};

// export data
export const processAndExport = (templateId, results, columns, customConfig = {}) => {
  const { template, filename, config, data } = applyTemplate(templateId, results, columns, customConfig);
  
  console.log("Processing:", template.id, "Category:", template.category, "type:", template.type);
  
  const exportFunctions = {
    'csv': exportAsCSV,
    'excel': exportAsExcel,
    'json': exportAsJSON
  };
  
  const exportFunction = exportFunctions[template.format];
  if (!exportFunction) {
    throw new Error(`Unsupported format: ${template.format}`);
  }
  
  exportFunction(data, columns, filename, config, template);
  return { success: true, filename };
};

const exportAsCSV = (results, columns, filename, config) => {
  const { includeHeader = true, delimiter = ',', bom = false, encoding = 'utf-8' } = config;
  let csvContent = '';
  
  //bom for Excel compatibility 
  if (bom) {
    csvContent = '\ufeff';
  }
  if (includeHeader) {
    csvContent += columns.join(delimiter) + '\n';
  }
  
  var i = 0;
  while (i < results.length) {
    let row = results[i];
    let line = columns.map(col => {
      let val = row[col];
      if (!val) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(delimiter);
    csvContent += line + '\n';
    i++;
  }
  
  // ability to download
  const blob = new Blob([csvContent], { type: `text/csv;charset=${encoding}` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportAsExcel = (results, columns, filename, config, template) => {
  const { 
    sheetName = 'Query Results',
    addFilters = false,
    addTitle = false,
    titleText = 'Data Export',
    addDatetime = false,
    formatNumbers = false,
    addTotalRow = false,
    freezeHeaderRow = false,
    category,
    type
  } = config;

  const workbook = XLSX.utils.book_new();
  
  const rawDataSheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
  
  if (addFilters) {
    rawDataSheet['!autofilter'] = { ref: XLSX.utils.encode_range(
      { r: 0, c: 0 },
      { r: results.length, c: columns.length - 1 }
    )};
  }
  
  if (category === 'analysis') {
    if (template.id === 'analysis-statistical-summary') {
      addStatisticalSummarySheet(workbook, results, columns);
    } else if (template.id === 'analysis-category-grouping') {
      addCategoryAnalysisSheet(workbook, results, columns);
    }
  } else if (category === 'financial' && template.id === 'finance-quarterly-report') {
    addQuarterlyReportSheet(workbook, results, columns);
  } else {
    const dataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, dataSheet, sheetName);
    
    formatWorksheet(dataSheet, results, columns, {
      addTitle,
      titleText,
      addDatetime,
      formatNumbers,
      addTotalRow,
      freezeHeaderRow
    });
  }
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
};

function addStatisticalSummarySheet(workbook, results, columns) {
  let numericColumns = find_numeric_cols(results, columns);
  
  // Calculate basic stats
  let summaryData = [
    ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
  ];
  
  for (let col of numericColumns) {
    let values = getNumVals(results, col);
    let stats = calcStats(values);
    if (stats) {
      summaryData.push([
        col,
        stats.count,
        stats.min,
        stats.max,
        stats.sum,
        stats.avg,
        stats.stdDev
      ]);
    }
  }
  const statsSheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary Statistics');
}

function addCategoryAnalysisSheet(workbook, results, columns) {
  let numericColumns = find_numeric_cols(results, columns);
  let cats = getUniq(results.map(r => r[columns[0]]));
  let catData = [
    ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                         ...numericColumns.map(col => `Average ${col}`)]
  ];
  
  for (let cat of cats) {
    let catRows = results.filter(row => row[columns[0]] === cat);
    let count = catRows.length;
    
    let row = [cat, count];
    
    numericColumns.forEach(col => {
      var s = 0;
      for (var j = 0; j < catRows.length; j++) {
        let v = catRows[j][col];
        if (typeof v === 'number') s += v;
        else if (!isNaN(parseFloat(v))) s += parseFloat(v);
      }
      row.push(s);
    });
    
    for (let col of numericColumns) {
      let values = getNumVals(catRows, col);
      let avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      row.push(avg);
    }
    catData.push(row);
  }
  
  const catSheet = XLSX.utils.aoa_to_sheet(catData);
  XLSX.utils.book_append_sheet(workbook, catSheet, 'Category Analysis');
}

function addQuarterlyReportSheet(workbook, results, columns) {
  let dateCol = null;
  for (let col of columns) {
    if (col.toLowerCase().includes('date') || 
        col.toLowerCase().includes('period') || 
        col.toLowerCase().includes('quarter')) {
      dateCol = col;
      break;
    }
  }
  
  let typeCol = null;
  for (let col of columns) {
    if (col.toLowerCase().includes('type') || 
        col.toLowerCase().includes('category') || 
        col.toLowerCase().includes('segment')) {
      typeCol = col;
      break;
    }
  }
  
  let amountCol = null;
  for (let col of columns) {
    if (col.toLowerCase().includes('amount') || 
        col.toLowerCase().includes('value') || 
        col.toLowerCase().includes('total') ||
        col.toLowerCase().includes('sum')) {
      amountCol = col;
      break;
    }
  }
  
  if (dateCol && amountCol) {
    if (typeCol) {
      let periods = getUniq(results.map(r => r[dateCol]));
      
      let types = getUniq(results.map(r => r[typeCol]));
      
      let periodData = [
        ['Period', ...types, 'Total']
      ];
      
      for (let period of periods) {
        let periodRows = results.filter(row => row[dateCol] === period);
        let row = [period];
        
        let periodTotal = 0;
        for (let type of types) {
          let typeRows = periodRows.filter(row => row[typeCol] === type);
          let typeSum = 0;
        
          for (let dataRow of typeRows) {
            let val = dataRow[amountCol];
            if (typeof val === 'number') {
              typeSum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              typeSum += parseFloat(val);
            }
          }
          row.push(typeSum);
          periodTotal += typeSum;
        }
        row.push(periodTotal);
        periodData.push(row);
      }
      
      let totalsRow = ['Total'];
      let grandTotal = 0;
      
      for (let i = 0; i < types.length; i++) {
        let typeTotal = 0;
        for (let j = 1; j < periodData.length; j++) {
          typeTotal += periodData[j][i + 1] || 0;
        }
        totalsRow.push(typeTotal);
        grandTotal += typeTotal;
      }
      
      totalsRow.push(grandTotal);
      periodData.push(totalsRow);
      
      const periodSheet = XLSX.utils.aoa_to_sheet(periodData);
      XLSX.utils.book_append_sheet(workbook, periodSheet, 'Quarterly Report');
    }
  }
}

// Format an Excel worksheet with common formatting options
function formatWorksheet(worksheet, results, columns, options) {
  const {
    addHeader = true,
    formatNumbers = true,
    addTotalRow = false,
    boldHeader = true,
    alternateRowColors = false,
    rowOffset = 0, // used for combining multiple tables
  } = options;
  
  if (addHeader) {
    // probably not the best way - xlsx utils maybe better
    let row = [];
    for (let i = 0; i < columns.length; i++) {
      row.push({ v: columns[i], t: 's' });
    }
    
    XLSX.utils.sheet_add_aoa(worksheet, [columns], { origin: { r: rowOffset, c: 0 } });
    
    // Bold the headers - not sure if this works everywhere
    for (let i = 0; i < columns.length; i++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowOffset, c: i })];
      if (cell && boldHeader) {
        if (!cell.s) cell.s = {};
        cell.s.font = { bold: true };
      }
    }
  }
  
  XLSX.utils.sheet_add_json(worksheet, results, {
    origin: { r: rowOffset + (addHeader ? 1 : 0), c: 0 },
    header: columns,
    skipHeader: true,
  });
  
  if (formatNumbers) {
    const numericColumns = find_numeric_cols(results, columns);
    
    const headerToCol = {};
    columns.forEach((col, idx) => {
      headerToCol[col] = XLSX.utils.encode_col(idx);
    });
    
    // Todo:fix later
    numericColumns.forEach(col => {
      const colLetter = headerToCol[col];
      const range = `${colLetter}${rowOffset + 2}:${colLetter}${rowOffset + results.length + 1}`;
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      const colIdx = columns.indexOf(col);
      worksheet['!cols'][colIdx] = { numFmt: '#,##0.00' };
      
      // doesn’t seem to work as expected
      // const formatInfo = { numFmt: '#,##0.00' };
      // for (let i = 0; i < results.length; i++) {
      //   const cellAddr = `${colLetter}${rowOffset + 2 + i}`;
      //   const cell = worksheet[cellAddr];
      //   if (cell) {
      //     if (!cell.s) cell.s = {};
      //     cell.s.numFmt = '#,##0.00';
      //   }
      // }
    });
  }
  
  if (addTotalRow) {
    let numericColumns = find_numeric_cols(results, columns);
    
    if (numericColumns.length > 0) {
      let totalRow = Array(columns.length).fill('');
      totalRow[0] = 'Total';
      
      for (let numCol of numericColumns) {
        let sum = 0;
        // probably could use .reduce here, but this works for now
        for (let i = 0; i < results.length; i++) {
          const val = results[i][numCol];
          if (typeof val === 'number') {
            sum += val;
          } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
            sum += parseFloat(val);
          }
        }
        totalRow[columns.indexOf(numCol)] = sum;
      }
      
      const totalRowIndex = rowOffset + results.length + 1;
      XLSX.utils.sheet_add_aoa(worksheet, [totalRow], 
        { origin: { r: totalRowIndex, c: 0 } });
    }
  }
}

const exportAsJSON = (results, filename, config, template) => {
  // simple json export
  // just need indent for readability
  const indent = 2;
  
  
  // add creation time to the output
  const timestamp = new Date().toISOString();
  
  let output = {
    generated: timestamp,
    count: results.length,
    data: results
  };
  
  const jsonStr = JSON.stringify(output, null, indent);
  
  // download the file
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function escapeCsvField(value) {
  if (!value) return '';
  
  const s = String(value);

  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};
function getUniq(arr) {
  return [...new Set(arr)];
}

function getNumVals(data, column) {
  const vals = [];
  for (let row of data) {
    let val = row[column];
    if (typeof val === 'number') {
      vals.push(val);
    } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
      vals.push(parseFloat(val));
    }
  }
  return vals;
}

function calcStats(values) {
  // need to handle bad inputs better!
  if (!values || values.length === 0) {
    return null;
  }
  
  // not sure why but got some NaN values sometimes
  // so filter them out
  values = values.filter(v => !isNaN(v));
  
  if (values.length === 0) {
    console.warn('No valid numeric values to calculate stats');
    return null;
  }
  
  let mySum = 0; 
  let min = values[0];
  let max = values[0];
  
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    mySum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const avg = mySum / values.length;
  let sumSquaredDiffs = 0;
  values.forEach(v => {
    // const diff = v - avg;
    // sumSquaredDiffs += diff * diff;
    sumSquaredDiffs += Math.pow(v - avg, 2);
  });
  
  const variance = sumSquaredDiffs / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: values.length,
    min,
    max,
    sum: mySum,
    avg,
    stdDev
  };
}

function find_numeric_cols(data, columns) {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return [];
  }
  let result = [];
  
  // Check up to first 10 rows to identify numeric columns
  const max_rows_to_check = Math.min(10, data.length);
  
  for (let col of columns) {
    let hasNumbers = false;
    // Check if any value in sample is numeric
    for (let i = 0; i < max_rows_to_check; i++) {
      const val = data[i][col];
      
      if (
        typeof val === 'number' || 
        (typeof val === 'string' && !isNaN(parseFloat(val)) && val.trim() !== '')
      ) {
        hasNumbers = true;
        break;
      }
    }
    
    if (hasNumbers) {
      result.push(col);
    }
  }
  return result;
}

function findColByPattern(columns, patterns) {
  for (let pattern of patterns) {
    for (let col of columns) {
      if (col.toLowerCase().includes(pattern)) {
        return col;
      }
    }
  }
  return null;
}
