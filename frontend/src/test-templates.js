/**
 * Export Templates Test Script
 * 
 * This script demonstrates how to use the export templates directly
 * 
 * To use: Import in your component and call the testStatisticalSummary function
 * with your data and columns.
 */

import * as XLSX from 'xlsx';
import { exportTemplates } from './utils/exportTemplates';
import { processAndExport } from './utils/templateProcessor';

/**
 * Test the Statistical Summary template
 */
export const testStatisticalSummary = (results, columns) => {
  console.log('Starting statistical summary test...');
  
  // Find the template we want to use
  let template = null;
  for (let i = 0; i < exportTemplates.length; i++) {
    if (exportTemplates[i].id === 'analysis-statistical-summary') {
      template = exportTemplates[i];
      break;
    }
  }
  
  if (!template) {
    console.error('Could not find the statistical summary template!');
    return;
  }
  
  console.log('Testing Statistical Summary template with', results.length, 'rows');
  console.log('Template found:', template.name);
  
  // Find numeric columns by checking each row
  let numericColumns = [];
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    let hasNumbers = false;
    
    // Check some rows to see if there are numbers
    for (let j = 0; j < results.length; j++) {
      let val = results[j][col];
      if (typeof val === 'number' || !isNaN(parseFloat(val))) {
        hasNumbers = true;
        break;
      }
    }
    
    if (hasNumbers) {
      numericColumns.push(col);
    }
  }
  
  console.log('Found numeric columns:', numericColumns);
  
  // Calculate stats for each numeric column
  let stats = [];
  for (let i = 0; i < numericColumns.length; i++) {
    let col = numericColumns[i];
    
    // Get all values for this column
    let values = [];
    for (let j = 0; j < results.length; j++) {
      let val = parseFloat(results[j][col]);
      if (!isNaN(val)) {
        values.push(val);
      }
    }
    
    if (values.length === 0) {
      console.log('No valid numeric values found for column:', col);
      continue;
    }
    
    // Sort values for median calculation
    let sortedValues = values.slice(); // make a copy
    sortedValues.sort(function(a, b) {
      return a - b;
    });
    
    // Calculate basic statistics
    let count = values.length;
    
    // Calculate sum
    let sum = 0;
    for (let j = 0; j < values.length; j++) {
      sum += values[j];
    }
    
    let mean = sum / count;
    let min = sortedValues[0]; // already sorted
    let max = sortedValues[sortedValues.length - 1]; // already sorted
    
    // Calculate median 
    let median;
    if (count % 2 === 0) {
      // Even number of elements
      let mid1 = sortedValues[count/2 - 1];
      let mid2 = sortedValues[count/2];
      median = (mid1 + mid2) / 2;
    } else {
      // Odd number of elements
      median = sortedValues[Math.floor(count/2)];
    }
    
    // Calculate standard deviation
    let sumSquaredDiff = 0;
    for (let j = 0; j < values.length; j++) {
      let diff = values[j] - mean;
      sumSquaredDiff += diff * diff;
    }
    let variance = sumSquaredDiff / count;
    let stddev = Math.sqrt(variance);
    
    // Save stats for this column
    stats.push({
      column: col,
      stats: {
        'Count': count,
        'Min': min.toFixed(2),
        'Max': max.toFixed(2),
        'Sum': sum.toFixed(2),
        'Mean': mean.toFixed(2),
        'Median': median.toFixed(2),
        'Std Dev': stddev.toFixed(2)
      }
    });
    
    // Debug: print out statistics for this column
    console.log(`Stats for ${col}:`, {
      count: count,
      min: min.toFixed(2),
      max: max.toFixed(2),
      sum: sum.toFixed(2),
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stddev: stddev.toFixed(2)
    });
  }
  
  // Create an Excel workbook
  const workbook = XLSX.utils.book_new();
  
  // Add the raw data first
  const rawDataSheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
  
  // Now create the statistics sheet
  // First create the headers row
  const statsData = [
    ['Column', 'Count', 'Min', 'Max', 'Sum', 'Mean', 'Median', 'Std Dev']
  ];
  
  // Then add each column's statistics
  for (let i = 0; i < stats.length; i++) {
    let stat = stats[i];
    statsData.push([
      stat.column,
      stat.stats['Count'],
      stat.stats['Min'],
      stat.stats['Max'],
      stat.stats['Sum'],
      stat.stats['Mean'],
      stat.stats['Median'],
      stat.stats['Std Dev']
    ]);
  }
  
  // Create and add the statistics sheet
  const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary Statistics');
  
  // Save the file
  let filename = 'statistical-summary.xlsx';
  XLSX.writeFile(workbook, filename);
  
  console.log('Statistics generated for', stats.length, 'columns');
  console.log('Excel file created:', filename);
  console.log('Test completed successfully!');
  
  return stats;
};

/**
 * Test Category Analysis template
 */
export const testCategoryAnalysis = (results, columns) => {
  console.log('Starting category analysis test...');
  
  // Try to find a column that might be a category
  let categoryColumn = null;
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i].toLowerCase();
    if (col.includes('category') || col.includes('type') || col.includes('group')) {
      categoryColumn = columns[i];
      break;
    }
  }
  
  if (!categoryColumn) {
    console.error('No category column found in the data! Need a column with category/type/group in the name');
    return;
  }
  
  // Find columns with numeric data
  let numericColumns = [];
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    let hasNumbers = false;
    
    // Check if column has numeric values
    for (let j = 0; j < Math.min(10, results.length); j++) { // Only check first 10 rows to save time
      let val = results[j][col];
      if (typeof val === 'number' || !isNaN(parseFloat(val))) {
        hasNumbers = true;
        break;
      }
    }
    
    if (hasNumbers) {
      numericColumns.push(col);
    }
  }
  
  if (numericColumns.length === 0) {
    console.error('No numeric columns found for analysis! Cannot create category analysis');
    return;
  }
  
  console.log('Doing category analysis on', categoryColumn, 'with metrics:', numericColumns);
  
  // Get all unique categories
  let categories = [];
  for (let i = 0; i < results.length; i++) {
    let category = results[i][categoryColumn];
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }
  
  console.log('Found categories:', categories);
  
  // For each category, calculate metrics
  let categoryStats = [];
  for (let i = 0; i < categories.length; i++) {
    let category = categories[i];
    
    // Find all rows for this category
    let categoryRows = [];
    for (let j = 0; j < results.length; j++) {
      if (results[j][categoryColumn] === category) {
        categoryRows.push(results[j]);
      }
    }
    
    // Calculate stats for numeric columns
    let metrics = {};
    
    for (let j = 0; j < numericColumns.length; j++) {
      let col = numericColumns[j];
      
      // Get values
      let values = [];
      for (let k = 0; k < categoryRows.length; k++) {
        let val = parseFloat(categoryRows[k][col]);
        if (!isNaN(val)) {
          values.push(val);
        }
      }
      
      if (values.length === 0) {
        console.log('No valid numeric values for', col, 'in category', category);
        continue;
      }
      
      // Calculate sum
      let sum = 0;
      for (let k = 0; k < values.length; k++) {
        sum += values[k];
      }
      
      let count = values.length;
      let mean = sum / count;
      
      // TODO: Add more statistics like median and standard deviation
      
      metrics[col] = {
        count: count,
        sum: sum.toFixed(2),
        mean: mean.toFixed(2)
      };
    }
    
    categoryStats.push({
      category: category,
      count: categoryRows.length,
      metrics: metrics
    });
    
    // Debug info
    console.log(`Category ${category} has ${categoryRows.length} items`);
  }
  
  // Create workbook for Excel
  const workbook = XLSX.utils.book_new();
  
  // Add raw data sheet
  const rawDataSheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
  
  // Create category summary data
  const summaryData = [];
  
  // Create header row
  const headerRow = ['Category', 'Count'];
  for (let i = 0; i < numericColumns.length; i++) {
    let col = numericColumns[i];
    headerRow.push(`${col} (Sum)`);
    headerRow.push(`${col} (Mean)`);
  }
  summaryData.push(headerRow);
  
  // Add data for each category
  for (let i = 0; i < categoryStats.length; i++) {
    let stat = categoryStats[i];
    let row = [stat.category, stat.count];
    
    for (let j = 0; j < numericColumns.length; j++) {
      let col = numericColumns[j];
      
      // If we have metrics for this column, add them
      if (stat.metrics[col]) {
        row.push(stat.metrics[col].sum);
        row.push(stat.metrics[col].mean);
      } else {
        row.push('N/A');
        row.push('N/A');
      }
    }
    
    summaryData.push(row);
  }
  
  // Add category summary sheet
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Category Analysis');
  
  // Save the Excel file
  let filename = 'category-analysis.xlsx';
  XLSX.writeFile(workbook, filename);
  
  console.log('Category analysis completed for', categories.length, 'categories');
  console.log('Excel file created:', filename);
  console.log('Test completed successfully!');
  
  return categoryStats;
};

// Helper function to add test functionality to the window object
// This makes it easier to test from the browser console
export const addExportTestFunction = () => {
  // Add a global function for testing
  window.testExportTemplate = function(templateId, results, columns) {
    console.log('Testing export template with ID:', templateId);
    console.log('Data rows:', results.length);
    console.log('Columns:', columns);
    
    try {
      return processAndExport(templateId, results, columns, {});
    } catch (error) {
      console.error('Error testing template:', error);
      alert('Error testing template: ' + error.message);
      return null;
    }
  };
  
  console.log('Test function added to window object. Use window.testExportTemplate() to test');
};
