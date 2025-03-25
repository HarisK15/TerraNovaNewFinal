// todo: add better error handling
// this file processes data according to export templates
import * as XLSX from 'xlsx';
import { applyTemplate } from './exportTemplates';
// import moment from 'moment'; 
// import { saveAs } from 'file-saver';
const debug = true;

// function calcMovingAverage(data, period) {
//   //mplement 
// }

// process transformation 
export const processTransformation = (templateId, data, columns, config = {}) => {
  console.log('Processing:', templateId);
  // console.log('Data sample:', data.slice(0, 2));
  // Get template properties
  const { category, type } = config;
  
  // Statistical Summary - calculate basic statistics for numeric columns
  if (category === 'analysis' && templateId === 'analysis-statistical-summary') {
    // Figure out which columns have numbers
    let num_cols = [];
    for (let col of columns) {
      let hasNumbers = false;
      for (let row of data) {
        if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
          hasNumbers = true;
          break;
        }
      }
      if (hasNumbers) {
        num_cols.push(col);
      }
    }
    
    console.log('Found columns->', num_cols);
    
    // For each numeric column, calculate stats
    let summaryData = [
      ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
    ];
    
    // each column
    for (let col of num_cols) {
      // get vals
      let vals = [];
      data.forEach(function(row) {
        let v = row[col];
        if (typeof v === 'number') {
          vals.push(v);
        } else if (typeof v === 'string' && !isNaN(parseFloat(v))) {
          vals.push(parseFloat(v));
        }
      });
      
      if (vals.length === 0) continue;
      
      // Calculate basic stats
      let count = vals.length;
      let min = Math.min(...vals);
      let max = Math.max(...vals);
      let sum = 0;
      for (let val of vals) {
        sum += val;
      }
      let avg = sum / count;
      
      // Calculate standard deviation
      let sqDiffs = 0;
      for (let val of vals) {
        sqDiffs += Math.pow(val - avg, 2);
      }
      let stdDev = Math.sqrt(sqDiffs / count);
      
      // Add this row to summary
      summaryData.push([
        col,
        count,
        min,
        max,
        sum,
        avg,
        stdDev
      ]);
      console.log('Sum for' + col + 'in statistical summary' + sum);
    }
    
    return { summaryData };
  }
  
  // Category Analysis - group by category and calculate sums/averages
  else if (category === 'analysis' && templateId === 'analysis-category-grouping') {
    // Try to find a category column
    let categoryCol = null;
    for (let col of columns) {
      if (col.toLowerCase().includes('category') || 
          col.toLowerCase().includes('type') || 
          col.toLowerCase().includes('group')) {
        categoryCol = col;
        break;
      }
    }
    
    // also check for these other potential category columns
    // if (!categoryCol) {
    //   for (let col of columns) {
    //     if (col.toLowerCase().includes('class') || 
    //         col.toLowerCase().includes('segment') || 
    //         col.toLowerCase().includes('section')) {
    //       categoryCol = col;
    //       break;
    //     }
    //   }
    // }
    
    if (categoryCol) {
      console.log(' found column for categories:', categoryCol);
      
      // Find numeric columns
      let numericColumns = [];
      for (let col of columns) {
        if (col !== categoryCol) {
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
      }
      
      // Get all unique categories
      let cats = [];
      const results = data; // FIXME: clean this up later, just to fix ESLint error
      results.forEach(r => {
        if (!cats.includes(r[columns[0]])) {
          cats.push(r[columns[0]]);
        }
      });
      
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
          // this is faster than using reduce I think
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
          let sum = 0;
          for (let dataRow of catRows) {
            let val = dataRow[col];
            if (typeof val === 'number') {
              sum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              sum += parseFloat(val);
            }
          }
          row.push(sum / count);
        }
        
        catData.push(row);
      }
      
      // Create category analysis sheet
      const catSheet = XLSX.utils.aoa_to_sheet(catData);
      /* eslint-disable no-undef */
      // Using global scope to avoid declaration issues - quick and dirty hack!
      if (typeof window._workbook === 'undefined') {
        window._workbook = XLSX.utils.book_new();
      }
      // Now use the global workbook
      XLSX.utils.book_append_sheet(window._workbook, catSheet, 'Category Analysis');
      
      return { catData };
    }
  }
  
  // Todo: implement histogram   
  // Periods/Quarterly Analysis
  else if (category === 'financial' && templateId === 'finance-quarterly-report') {
    // still buggy  
    // Find date column
    let dateCol = null;
    for (let col of columns) {
      if (col.toLowerCase().includes('date') || 
          col.toLowerCase().includes('period') || 
          col.toLowerCase().includes('quarter')) {
        dateCol = col;
        break;
      }
    }
    
    // Find amount column
    let amountCol = null;
    for (let col of columns) {
      if (col.toLowerCase().includes('amount') || 
          col.toLowerCase().includes('value') || 
          col.toLowerCase().includes('revenue') ||
          col.toLowerCase().includes('expense')) {
        amountCol = col;
        break;
      }
    }
    
    if (dateCol && amountCol) {
      // Find type column
      let typeCol = null;
      for (let col of columns) {
        if (col !== dateCol && col !== amountCol &&
           col.toLowerCase().includes('type')) {
          typeCol = col;
          break;
        }
      }
      
      if (typeCol) {
        // Get all unique periods
        let periods = [];
        for (let row of data) {
          if (!periods.includes(row[dateCol])) {
            periods.push(row[dateCol]);
          }
        }
        
        // Get all unique types
        let types = [];
        for (let row of data) {
          if (!types.includes(row[typeCol])) {
            types.push(row[typeCol]);
          }
        }
        
        // Create data for each period and type
        let periodData = [
          ['Period', ...types, 'Total']
        ];
        
        for (let period of periods) {
          let periodRows = data.filter(row => row[dateCol] === period);
          let row = [period];
          let periodTotal = 0;
          
          // For each type
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
        
        // Add total row
        let totalRow = ['Total'];
        
        // Calculate column totals
        for (let i = 1; i < periodData[0].length; i++) {
          let colSum = 0;
          for (let j = 1; j < periodData.length; j++) {
            colSum += periodData[j][i] || 0;
          }
          totalRow.push(colSum);
        }
        
        periodData.push(totalRow);
        
        return { periodData };
      }
    }
  }
  
  console.log('Nothing available');
  return null;
};

// export data
export const processAndExport = (templateId, results, columns, customConfig = {}) => {
  // Get template configuration with processed data
  const { template, filename, config, data } = applyTemplate(templateId, results, columns, customConfig);
  
  console.log("Processing:", template.id, "Category:", template.category, "type:", template.type);
  
  // Process based on format
  switch (template.format) {
    case 'csv':
      exportAsCSV(data, columns, filename, config);
      break;
    case 'excel':
      exportAsExcel(data, columns, filename, config, template);
      break;
    case 'json':
      exportAsJSON(data, filename, config, template);
      break;
    default:
      throw new Error(`Unsupported format: ${template.format}`);
  }
  
  return { success: true, filename };
};

// export data as CSV
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
  
  // alternate implementation with array.map and join
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
  // Statistics
  if (category === 'analysis' && template.id === 'analysis-statistical-summary') {
    const rawDataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    // filters still not working!
    if (addFilters) {
      rawDataSheet['!autofilter'] = { ref: XLSX.utils.encode_range(
        { r: 0, c: 0 },
        { r: results.length, c: columns.length - 1 }
      )};
    }
    
    let numericColumns = [];
    for (let col of columns) {
      for (let row of results) {
        if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
          numericColumns.push(col);
          break;
        }
      }
    }
    
    // Calculate basic stats
    let summaryData = [
      ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
    ];
    
    for (let col of numericColumns) {
      // Get values
      let values = [];
      for (let row of results) {
        let val = row[col];
        if (typeof val === 'number') {
          values.push(val);
        } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
          values.push(parseFloat(val));
        }
      }
      
      if (values.length === 0) continue;
      
      // Calculate basic stats
      let count = values.length;
      let min = Math.min(...values);
      let max = Math.max(...values);
      // sometimes I use reduce, sometimes loop - cleaner this way
      let total = values.reduce((a,b) => a+b, 0); 
      let avg = total / count;

      // Standard deviation
      let sqDiffs = 0;
      for (let i = 0; i < values.length; i++) {
        sqDiffs += Math.pow(values[i] - avg, 2);
      }
      let stdDev = Math.sqrt(sqDiffs / count);
      summaryData.push([col, count, min, max, total, avg, stdDev]);
    }
    
    // Create summary sheet   
    const statsSheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary Statistics');
    
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
    return;
  }
  
  // Category analysis template
  else if (category === 'analysis' && template.id === 'analysis-category-grouping') {
    // Add raw data sheet
    const rawDataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    
    // Find numeric columns
    let numericColumns = [];
    for (let col of columns) {
      for (let row of results) {
        if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
          numericColumns.push(col);
          break;
        }
      }
    }
    
    // Get unique categories
    let cats = [];
    results.forEach(r => {
      if (!cats.includes(r[columns[0]])) {
        cats.push(r[columns[0]]);
      }
    });
    
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
        // this is faster than using reduce I think
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
        let sum = 0;
        for (let dataRow of catRows) {
          let val = dataRow[col];
          if (typeof val === 'number') {
            sum += val;
          } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
            sum += parseFloat(val);
          }
        }
        row.push(sum / count);
      }
      
      catData.push(row);
    }
    
    // Create category analysis sheet
    const catSheet = XLSX.utils.aoa_to_sheet(catData);
    /* eslint-disable no-undef */
    // Using global scope to avoid declaration issues - quick and dirty hack!
    if (typeof window._workbook === 'undefined') {
      window._workbook = XLSX.utils.book_new();
    }
    // Now use the global workbook
    XLSX.utils.book_append_sheet(window._workbook, catSheet, 'Category Analysis');
    
    XLSX.writeFile(window._workbook, filename, { bookType: 'xlsx' });
    return;
  }
  
  // Financial report template 
  else if (category === 'financial' && template.id === 'finance-quarterly-report') {
    // Add raw data sheet
    const rawDataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    
    // Find date column
    let dateCol = null;
    for (let col of columns) {
      if (col.toLowerCase().includes('date') || 
          col.toLowerCase().includes('period') || 
          col.toLowerCase().includes('quarter')) {
        dateCol = col;
        break;
      }
    }
    
    // Find amount column
    let amountCol = null;
    for (let col of columns) {
      if (col.toLowerCase().includes('amount') || 
          col.toLowerCase().includes('value') || 
          col.toLowerCase().includes('revenue') ||
          col.toLowerCase().includes('expense')) {
        amountCol = col;
        break;
      }
    }
    
    if (dateCol && amountCol) {
      // Find type column
      let typeCol = null;
      for (let col of columns) {
        if (col !== dateCol && col !== amountCol &&
           col.toLowerCase().includes('type')) {
          typeCol = col;
          break;
        }
      }
      
      if (typeCol) {
        // Get all unique periods
        let periods = [];
        for (let row of results) {
          if (!periods.includes(row[dateCol])) {
            periods.push(row[dateCol]);
          }
        }
        
        // Get all unique types
        let types = [];
        for (let row of results) {
          if (!types.includes(row[typeCol])) {
            types.push(row[typeCol]);
          }
        }
        
        // Create quarterly report data
        let periodData = [
          ['Period', ...types, 'Total']
        ];
        
        for (let period of periods) {
          let periodRows = results.filter(row => row[dateCol] === period);
          let row = [period];
          let periodTotal = 0;
          
          // For each type
          for (let type of types) {
            let typeRows = periodRows.filter(row => row[typeCol] === type);
            let typeSum = 0;
            
            // Sum all values for this type in this period
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
        
        // Add total row
        let totalRow = ['Total'];
        
        // Calculate column totals
        for (let i = 1; i < periodData[0].length; i++) {
          let colSum = 0;
          for (let j = 1; j < periodData.length; j++) {
            colSum += periodData[j][i] || 0;
          }
          totalRow.push(colSum);
        }
        
        periodData.push(totalRow);
        
        // Create quarterly report sheet
        const quarterlySheet = XLSX.utils.aoa_to_sheet(periodData);
        XLSX.utils.book_append_sheet(workbook, quarterlySheet, 'Quarterly Report');
        
        XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
        return;
      }
    }
  }
  
  // Default handling for basic templates
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(results);
  
  // Add filters if requested
  if (addFilters) {
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(
      { r: 0, c: 0 },
      { r: results.length, c: columns.length - 1 }
    )};
  }
  
  // Add sheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Add title and date if needed
  if (addTitle || addDatetime) {
    // Create a new worksheet with title
    let titleRows = [];
    
    // Add title row
    if (addTitle) {
      titleRows.push([titleText]);
    }
    
    // Add date row
    if (addDatetime) {
      titleRows.push([new Date().toLocaleString()]);
    }
    
    // Add empty separator row
    titleRows.push([]);
    
    // Add header row
    titleRows.push(columns);
    
    // Add data rows
    for (let row of results) {
      let dataRow = [];
      for (let col of columns) {
        dataRow.push(row[col]);
      }
      titleRows.push(dataRow);
    }
    
    // Create new sheet from this data
    const titleWorksheet = XLSX.utils.aoa_to_sheet(titleRows);
    
    // Replace sheet in workbook
    workbook.Sheets[sheetName] = titleWorksheet;
    
    // Calculate row offset for other features
    const rowOffset = (addTitle ? 1 : 0) + (addDatetime ? 1 : 0) + 1; // +1 for empty row
    
    // Add column filters if specified
    if (addFilters) {
      titleWorksheet['!autofilter'] = { ref: XLSX.utils.encode_range(
        { r: rowOffset, c: 0 },
        { r: rowOffset + results.length, c: columns.length - 1 }
      )};
    }
    
    // Freeze header row if specified
    if (freezeHeaderRow) {
      titleWorksheet['!freeze'] = { xSplit: 0, ySplit: rowOffset + 1 };
    }
  } else if (freezeHeaderRow) {
    // Freeze header row (without title)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }
  
  // Add total row if requested
  if (addTotalRow) {
    // Find numeric columns
    let numericColumns = [];
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      // Check if column contains numeric data
      for (let j = 0; j < results.length; j++) {
        const val = results[j][col];
        if (typeof val === 'number' || !isNaN(parseFloat(val))) {
          numericColumns.push({ index: i, name: col });
          break;
        }
      }
    }
    
    if (numericColumns.length > 0) {
      // Create total row
      let totalRow = Array(columns.length).fill('');
      totalRow[0] = 'Total'; // Add "Total" in first cell
      
      // Calculate totals for numeric columns
      for (let numCol of numericColumns) {
        let sum = 0;
        for (let i = 0; i < results.length; i++) {
          const val = results[i][numCol.name];
          if (typeof val === 'number') {
            sum += val;
          } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
            sum += parseFloat(val);
          }
        }
        totalRow[numCol.index] = sum;
      }
      
      // Add the total row to the sheet
      const rowOffset = addTitle || addDatetime 
          ? ((addTitle ? 1 : 0) + (addDatetime ? 1 : 0) + 1 + results.length + 1) 
          : (results.length + 1);
      
      XLSX.utils.sheet_add_aoa(
        workbook.Sheets[sheetName],
        [totalRow],
        { origin: { r: rowOffset, c: 0 } }
      );
    }
  }
  
  // Save the Excel file
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
};

/**
 * Export data as JSON
 */
const exportAsJSON = (results, filename, config, template) => {
  // different approaches we could use:
  //   - just stringify the data (method 1 - simplest)
  //   - create custom format based on template (method 2 - more complex)
  //   - use a library for better formatting (method 3 - need dependency)

  // METHOD 1 - simple json output

  // add some metadata
  let meta = {
    exportDate: new Date().toISOString(),
    count: results.length,
    template: template ? template.name : 'None'
  };

  // combine data with metadata 
  let export_data = {
    meta: meta,
    data: results
  };

  // convert to string with pretty formatting
  let json_str = JSON.stringify(export_data, null, 2);

  // create blob
  let blob = new Blob([json_str], { type: 'application/json' });

  // create download link
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;

  // click the link to download
  document.body.appendChild(a);
  a.click();

  // cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return true;
}

// helper function for CSV export - work in progress
function escapeCsvField(value) {
  if (!value) return '';
  
  // Convert to string
  const s = String(value);
  
  // Check if we need to escape
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${s.replace(/"/g, '""')}"`;
  }
  
  return s;
};

// get unique elements from array - utility function
// (found this online somewhere)
function getUniq(arr) {
  return [...new Set(arr)];
}

// const testData = [
//   { name: 'John', age: 30, city: 'New York' },
//   { name: 'Jane', age: 25, city: 'Los Angeles' },
//   { name: 'Bob', age: 40, city: 'Chicago' }
// ];
