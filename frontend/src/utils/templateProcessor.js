// todo: add better error handling
// this file processes data according to the export templates
import * as XLSX from 'xlsx';
import { applyTemplate } from './exportTemplates';
// import moment from 'moment'; 
// import { saveAs } from 'file-saver';



const debug = true;



export const processTransformation = (templateId, data, columns, config = {}) => {
  console.log('Processing:', templateId);
  // console.log('Data sample:', data.slice(0, 2));
  const { category, type } = config;
  
  // Statistical Summary - calculate statistics for numeric columns
  if (category === 'analysis' && templateId === 'analysis-statistical-summary') {
    let num_cols = findNumericColumns(data, columns);
    console.log('Found columns->', num_cols);
    
    // For each numeric column, calculate stats
    let summaryData = [
      ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
    ];
    
    for (let col of num_cols) {
      let values = getNumericValues(data, col);
      let stats = calculateStats(values);
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
        console.log('Sum for' + col + 'in statistical summary' + stats.sum);
      }
    }
    
    return { summaryData };
  }
  
  // Category Analysis - group by category and calculate sums/averages
  else if (category === 'analysis' && templateId === 'analysis-category-grouping') {
    // Try to find a category column
    let categoryCol = findColumnByPattern(columns, ['category', 'type', 'group']);
    
    if (categoryCol) {
      console.log(' found column for categories:', categoryCol);
      
      let numericColumns = findNumericColumns(data, columns);
      
      // Get all unique categories
      let cats = getUniq(data.map(r => r[categoryCol]));
      
      let catData = [
        ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                             ...numericColumns.map(col => `Average ${col}`)]
      ];
      
      for (let cat of cats) {
        let catRows = data.filter(row => row[categoryCol] === cat);
        let count = catRows.length;
        let row = [cat, count];
        
        // Add sums for each numeric column
        numericColumns.forEach(col => {
          const values = getNumericValues(catRows, col);
          const sum = values.reduce((a, b) => a + b, 0);
          row.push(sum);
        });
        
        // Add averages for each numeric column
        numericColumns.forEach(col => {
          const values = getNumericValues(catRows, col);
          const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          row.push(avg);
        });
        
        catData.push(row);
      }
      
      // Create category analysis sheet
      const catSheet = XLSX.utils.aoa_to_sheet(catData);
      /* eslint-disable no-undef */
      if (typeof window._workbook === 'undefined') {
        window._workbook = XLSX.utils.book_new();
      }
      XLSX.utils.book_append_sheet(window._workbook, catSheet, 'Category Analysis');
      return { catData };
    }
  }
  
  // Periods/Quarterly Analysis
  else if (category === 'financial' && templateId === 'finance-quarterly-report') {
    // Find relevant columns
    let dateCol = findColumnByPattern(columns, ['date', 'period', 'quarter']);
    let amountCol = findColumnByPattern(columns, ['amount', 'value', 'total', 'sum', 'revenue', 'expense']);
    let typeCol = findColumnByPattern(columns, ['type', 'category', 'segment', 'class']);
    
    if (dateCol && amountCol && typeCol) {
      let periods = getUniq(data.map(r => r[dateCol]));
      let types = getUniq(data.map(r => r[typeCol]));
      
      // Create quarterly data structure
      let periodData = [
        ['Period', ...types, 'Total']
      ];
      
      // Process each period
      for (let period of periods) {
        let periodRows = data.filter(row => row[dateCol] === period);
        let row = [period];
        let periodTotal = 0;
        
        // Process each type
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
      
      // Create totals row
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
  // Get template config with processed data
  const { template, filename, config, data } = applyTemplate(templateId, results, columns, customConfig);
  
  console.log("Processing:", template.id, "Category:", template.category, "type:", template.type);
  
  // Process based on format
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

// Export data as Excel with advanced formatting
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
  
  // Add raw data sheet in all cases
  const rawDataSheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
  
  // Add filters if requested
  if (addFilters) {
    rawDataSheet['!autofilter'] = { ref: XLSX.utils.encode_range(
      { r: 0, c: 0 },
      { r: results.length, c: columns.length - 1 }
    )};
  }
  
  // Handle different templates
  if (category === 'analysis') {
    if (template.id === 'analysis-statistical-summary') {
      addStatisticalSummarySheet(workbook, results, columns);
    } else if (template.id === 'analysis-category-grouping') {
      addCategoryAnalysisSheet(workbook, results, columns);
    }
  } else if (category === 'financial' && template.id === 'finance-quarterly-report') {
    addQuarterlyReportSheet(workbook, results, columns);
  } else {
    // Default case - just export data as is
    const dataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, dataSheet, sheetName);
    
    // Format worksheet
    formatWorksheet(dataSheet, results, columns, {
      addTitle,
      titleText,
      addDatetime,
      formatNumbers,
      addTotalRow,
      freezeHeaderRow
    });
  }
  
  // Write the file and trigger download
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
};

// Add statistical summary sheet to workbook
function addStatisticalSummarySheet(workbook, results, columns) {
  let numericColumns = findNumericColumns(results, columns);
  
  // Calculate basic stats
  let summaryData = [
    ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
  ];
  
  for (let col of numericColumns) {
    let values = getNumericValues(results, col);
    let stats = calculateStats(values);
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
  
  // Create summary sheet   
  const statsSheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary Statistics');
}

// Add category analysis sheet to workbook
function addCategoryAnalysisSheet(workbook, results, columns) {
  let numericColumns = findNumericColumns(results, columns);
  
  // Get unique categories
  let cats = getUniq(results.map(r => r[columns[0]]));
  
  // Create data for category analysis
  let catData = [
    ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                         ...numericColumns.map(col => `Average ${col}`)]
  ];
  
  // For each category
  for (let cat of cats) {
    let catRows = results.filter(row => row[columns[0]] === cat);
    let count = catRows.length;
    
    let row = [cat, count];
    
    // Calculate sums for each numeric column
    numericColumns.forEach(col => {
      // Calculate sum
      var s = 0;
      for (var j = 0; j < catRows.length; j++) {
        let v = catRows[j][col];
        if (typeof v === 'number') s += v;
        else if (!isNaN(parseFloat(v))) s += parseFloat(v);
      }
      row.push(s);
    });
    
    // Calculate averages for each numeric column
    for (let col of numericColumns) {
      let values = getNumericValues(catRows, col);
      let avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      row.push(avg);
    }
    catData.push(row);
  }
  
  const catSheet = XLSX.utils.aoa_to_sheet(catData);
  XLSX.utils.book_append_sheet(workbook, catSheet, 'Category Analysis');
}

// Add quarterly report sheet to workbook
function addQuarterlyReportSheet(workbook, results, columns) {
  // Find date/period column
  let dateCol = null;
  for (let col of columns) {
    if (col.toLowerCase().includes('date') || 
        col.toLowerCase().includes('period') || 
        col.toLowerCase().includes('quarter')) {
      dateCol = col;
      break;
    }
  }
  
  // Find type/category column
  let typeCol = null;
  for (let col of columns) {
    if (col.toLowerCase().includes('type') || 
        col.toLowerCase().includes('category') || 
        col.toLowerCase().includes('segment')) {
      typeCol = col;
      break;
    }
  }
  
  // Find amount column
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
      
      // Add totals row
      let totalsRow = ['Total'];
      let grandTotal = 0;
      
      for (let i = 1; i < periodData[0].length; i++) {
        let colSum = 0;
        for (let j = 1; j < periodData.length; j++) {
          colSum += periodData[j][i] || 0;
        }
        totalsRow.push(colSum);
        grandTotal += colSum;
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
    addTitle,
    titleText,
    addDatetime,
    formatNumbers,
    addTotalRow,
    freezeHeaderRow
  } = options;
  
  let rowOffset = 0;
  
  // Add title if requested
  if (addTitle) {
    XLSX.utils.sheet_add_aoa(worksheet, [[titleText]], { origin: { r: 0, c: 0 } });
    rowOffset++;
  }
  
  // Add datetime if requested
  if (addDatetime) {
    const now = new Date();
    XLSX.utils.sheet_add_aoa(worksheet, [[`Generated: ${now.toLocaleString()}`]], 
      { origin: { r: rowOffset, c: 0 } });
    rowOffset++;
  }
  
  // Freeze header row if requested
  if (freezeHeaderRow) {
    worksheet['!freeze'] = { r: rowOffset + 1, c: 0 };
  }
  
  // Format numbers if requested
  if (formatNumbers) {
    // Find numeric columns
    const numericColumns = findNumericColumns(results, columns);
    
    // Create a map from header names to column letters
    const headerToCol = {};
    columns.forEach((col, idx) => {
      headerToCol[col] = XLSX.utils.encode_col(idx);
    });
    
    // Apply number format to numeric columns
    numericColumns.forEach(col => {
      const colLetter = headerToCol[col];
      const range = `${colLetter}${rowOffset + 2}:${colLetter}${rowOffset + results.length + 1}`;
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      const colIdx = columns.indexOf(col);
      worksheet['!cols'][colIdx] = { numFmt: '#,##0.00' };
    });
  }
  
  // Add total row if requested
  if (addTotalRow) {
    let numericColumns = findNumericColumns(results, columns);
    
    if (numericColumns.length > 0) {
      let totalRow = Array(columns.length).fill('');
      totalRow[0] = 'Total';
      
      // Calculate totals for each numeric column
      for (let numCol of numericColumns) {
        let sum = 0;
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
  const { 
    indent = 2, 
    includeMetadata = true, 
    nestProperties = false,
    wrapInArray = true
  } = config;
  
  let output;
  
  if (nestProperties) {
    // Group related properties as nested objects
    output = results.map(row => {
      const newRow = {};
      for (const key in row) {
        // Look for keys with underscore format (e.g., customer_name, customer_id)
        const parts = key.split('_');
        if (parts.length > 1) {
          const prefix = parts[0];
          const property = parts.slice(1).join('_');
          newRow[prefix] = newRow[prefix] || {};
          newRow[prefix][property] = row[key];
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });
  } else {
    output = results;
  }
  
  // Add metadata if requested
  if (includeMetadata) {
    const meta = {
      generated: new Date().toISOString(),
      count: results.length,
      fields: Object.keys(results[0] || {})
    };
    
    output = {
      meta,
      data: wrapInArray ? output : output[0]
    };
  } else if (!wrapInArray) {
    // Just return the first item if not wrapping in array
    output = output[0];
  }
  
  const jsonStr = JSON.stringify(output, null, indent);
  
  // Create download
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// helper functions
function escapeCsvField(value) {
  if (!value) return '';
  
  // convert to string
  const s = String(value);
  
  // check for escape
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

// get unique elements from array - utility function
function getUniq(arr) {
  return [...new Set(arr)];
}

// Extract numeric values from column data
function getNumericValues(data, column) {
  const values = [];
  for (let row of data) {
    let val = row[column];
    if (typeof val === 'number') {
      values.push(val);
    } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
      values.push(parseFloat(val));
    }
  }
  return values;
}

// Calculate basic statistics for an array of numeric values
function calculateStats(values) {
  if (values.length === 0) return null;
  
  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / count;
  
  // Calculate standard deviation
  const sqDiffs = values.reduce((total, val) => {
    return total + Math.pow(val - avg, 2);
  }, 0);
  const stdDev = Math.sqrt(sqDiffs / count);
  
  return { count, min, max, sum, avg, stdDev };
}

// Identify numeric columns in a dataset
function findNumericColumns(data, columns) {
  const numericColumns = [];
  for (let col of columns) {
    let hasNumbers = false;
    for (let row of data) {
      if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
        hasNumbers = true;
        break;
      }
    }
    if (hasNumbers) {
      numericColumns.push(col);
    }
  }
  return numericColumns;
}

// Find a column that matches any of the patterns
function findColumnByPattern(columns, patterns) {
  for (let pattern of patterns) {
    for (let col of columns) {
      if (col.toLowerCase().includes(pattern)) {
        return col;
      }
    }
  }
  return null;
}
