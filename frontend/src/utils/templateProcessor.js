/**
 * Template Processor
 * 
 * This utility processes data according to export templates
 */
import * as XLSX from 'xlsx';
import { applyTemplate } from './exportTemplates';

/**
 * Process transformation only, without exporting
 * This is used for direct testing of transformations
 */
export const processTransformation = (templateId, data, columns, config = {}) => {
  console.log('Processing transformation for template:', templateId);
  
  // Get template properties
  const { category, type } = config;
  
  // Statistical Summary - calculate basic statistics for numeric columns
  if (category === 'analysis' && templateId === 'analysis-statistical-summary') {
    // Figure out which columns have numbers
    let numericColumns = [];
    for (let col of columns) {
      // Check if column has numbers
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
    
    console.log('Found numeric columns:', numericColumns);
    
    // For each numeric column, calculate stats
    let summaryData = [
      ['Column', 'Count', 'Min', 'Max', 'Sum', 'Average', 'Std Dev']
    ];
    
    for (let col of numericColumns) {
      // Get all numeric values for this column
      let values = [];
      for (let row of data) {
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
      let sum = 0;
      for (let val of values) {
        sum += val;
      }
      let avg = sum / count;
      
      // Calculate standard deviation
      let squareDiffs = 0;
      for (let val of values) {
        squareDiffs += Math.pow(val - avg, 2);
      }
      let stdDev = Math.sqrt(squareDiffs / count);
      
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
    
    if (categoryCol) {
      console.log('Using column for categories:', categoryCol);
      
      // Find numeric columns
      let numericColumns = [];
      for (let col of columns) {
        if (col !== categoryCol) {
          // Check if column has numbers
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
      let categories = [];
      for (let row of data) {
        if (!categories.includes(row[categoryCol])) {
          categories.push(row[categoryCol]);
        }
      }
      
      // Create header row
      let categoryData = [
        ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                             ...numericColumns.map(col => `Average ${col}`)]
      ];
      
      // For each category, calculate metrics
      for (let category of categories) {
        // Get rows for this category
        let categoryRows = data.filter(row => row[categoryCol] === category);
        let rowCount = categoryRows.length;
        
        let row = [category, rowCount];
        
        // Calculate sums for each numeric column
        for (let col of numericColumns) {
          let sum = 0;
          for (let dataRow of categoryRows) {
            let val = dataRow[col];
            if (typeof val === 'number') {
              sum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              sum += parseFloat(val);
            }
          }
          row.push(sum);
        }
        
        // Calculate averages for each numeric column
        for (let col of numericColumns) {
          let sum = 0;
          for (let dataRow of categoryRows) {
            let val = dataRow[col];
            if (typeof val === 'number') {
              sum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              sum += parseFloat(val);
            }
          }
          row.push(sum / rowCount);
        }
        
        categoryData.push(row);
      }
      
      return { categoryData };
    }
  }
  
  // Periods/Quarterly Analysis
  else if (category === 'financial' && templateId === 'finance-quarterly-report') {
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
      // Find a type column
      let typeCol = null;
      for (let col of columns) {
        if (col !== dateCol && col !== amountCol &&
           (col.toLowerCase().includes('type') || 
            col.toLowerCase().includes('category') || 
            col.toLowerCase().includes('department'))) {
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
  
  // No transformation available
  console.log('No transformation available for this template');
  return null;
};

/**
 * Process and export data using a specific template
 */
export const processAndExport = (templateId, results, columns, customConfig = {}) => {
  // Get template configuration with processed data
  const { template, filename, config, data } = applyTemplate(templateId, results, columns, customConfig);
  
  console.log("Processing template:", template.id, "Category:", template.category, "Type:", template.type);
  
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

/**
 * Export data as CSV
 */
const exportAsCSV = (results, columns, filename, config) => {
  const { includeHeader = true, delimiter = ',', bom = false, encoding = 'utf-8' } = config;
  
  // Create CSV content
  let csvContent = '';
  
  // Add BOM for Excel compatibility if specified
  if (bom) {
    csvContent = '\ufeff';
  }
  
  // Add header row if specified
  if (includeHeader) {
    csvContent += columns.join(delimiter) + '\n';
  }
  
  // Add data rows
  for (let row of results) {
    let rowValues = [];
    
    for (let col of columns) {
      let value = row[col];
      
      // Handle null values and quoting
      if (value === null || value === undefined) {
        rowValues.push('');
      } else if (typeof value === 'string' && 
                (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
        // Quote strings with special characters
        rowValues.push(`"${value.replace(/"/g, '""')}"`);
      } else {
        rowValues.push(value);
      }
    }
    
    csvContent += rowValues.join(delimiter) + '\n';
  }
  
  // Download the file
  const blob = new Blob([csvContent], { type: `text/csv;charset=${encoding}` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data as Excel with advanced formatting
 */
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
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Statistical summary template
  if (category === 'analysis' && template.id === 'analysis-statistical-summary') {
    // Add raw data sheet first
    const rawDataSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    
    // Add filters if needed
    if (addFilters) {
      rawDataSheet['!autofilter'] = { ref: XLSX.utils.encode_range(
        { r: 0, c: 0 },
        { r: results.length, c: columns.length - 1 }
      )};
    }
    
    // Find numeric columns (brute force approach)
    let numericColumns = [];
    for (let col of columns) {
      for (let row of results) {
        if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
          numericColumns.push(col);
          break;
        }
      }
    }
    
    // Calculate basic stats for each numeric column
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
      
      // Calculate stats (these calculations would be in a student's code)
      let count = values.length;
      let min = Math.min(...values);
      let max = Math.max(...values);
      
      // Sum calculation (using explicit loop instead of reduce)
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += values[i];
      }
      
      let avg = sum / count;
      
      // Standard deviation calculation
      let squareDiffs = 0;
      for (let i = 0; i < values.length; i++) {
        squareDiffs += Math.pow(values[i] - avg, 2);
      }
      let stdDev = Math.sqrt(squareDiffs / count);
      
      summaryData.push([col, count, min, max, sum, avg, stdDev]);
    }
    
    // Create summary stats sheet
    const statsSheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary Statistics');
    
    XLSX.writeFile(workbook, filename);
    return;
  }
  
  // Category analysis template
  else if (category === 'analysis' && template.id === 'analysis-category-grouping') {
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
    
    if (categoryCol) {
      // Add raw data sheet
      const rawDataSheet = XLSX.utils.json_to_sheet(results);
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
      
      // Find numeric columns
      let numericColumns = [];
      for (let col of columns) {
        if (col !== categoryCol) {
          for (let row of results) {
            if (typeof row[col] === 'number' || !isNaN(parseFloat(row[col]))) {
              numericColumns.push(col);
              break;
            }
          }
        }
      }
      
      // Get unique categories
      let categories = [];
      for (let row of results) {
        if (!categories.includes(row[categoryCol])) {
          categories.push(row[categoryCol]);
        }
      }
      
      // Create data for category analysis
      let categoryData = [
        ['Category', 'Count', ...numericColumns.map(col => `Sum of ${col}`), 
                             ...numericColumns.map(col => `Average ${col}`)]
      ];
      
      // For each category
      for (let category of categories) {
        let categoryRows = results.filter(row => row[categoryCol] === category);
        let rowCount = categoryRows.length;
        
        let row = [category, rowCount];
        
        // Calculate sums for each numeric column
        for (let col of numericColumns) {
          let sum = 0;
          for (let dataRow of categoryRows) {
            let val = dataRow[col];
            if (typeof val === 'number') {
              sum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              sum += parseFloat(val);
            }
          }
          row.push(sum);
        }
        
        // Calculate averages for each numeric column
        for (let col of numericColumns) {
          let sum = 0;
          for (let dataRow of categoryRows) {
            let val = dataRow[col];
            if (typeof val === 'number') {
              sum += val;
            } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
              sum += parseFloat(val);
            }
          }
          row.push(sum / rowCount);
        }
        
        categoryData.push(row);
      }
      
      // Create category analysis sheet
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Analysis');
      
      XLSX.writeFile(workbook, filename);
      return;
    }
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
           (col.toLowerCase().includes('type') || 
            col.toLowerCase().includes('category') || 
            col.toLowerCase().includes('department'))) {
          typeCol = col;
          break;
        }
      }
      
      if (typeCol) {
        // Get unique periods
        let periods = [];
        for (let row of results) {
          if (!periods.includes(row[dateCol])) {
            periods.push(row[dateCol]);
          }
        }
        
        // Get unique types
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
        
        // For each period
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
        
        XLSX.writeFile(workbook, filename);
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
  XLSX.writeFile(workbook, filename);
};

/**
 * Export data as JSON
 */
const exportAsJSON = (results, filename, config, template) => {
  const { pretty = true, addMetadata = false } = config;
  
  // Create the output data
  let jsonData;
  
  if (addMetadata) {
    // Add some basic metadata
    jsonData = {
      metadata: {
        exportDate: new Date().toISOString(),
        rowCount: results.length,
        templateName: template.name,
        format: 'json'
      },
      data: results
    };
  } else {
    // Just use the raw data
    jsonData = results;
  }
  
  // Convert to JSON string
  let jsonString;
  if (pretty) {
    jsonString = JSON.stringify(jsonData, null, 2);
  } else {
    jsonString = JSON.stringify(jsonData);
  }
  
  // Download the file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
