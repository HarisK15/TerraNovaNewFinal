/**
 * Direct Export Template Test
 * Run this with Node.js to see template transformations
 */

const fs = require('fs');
const XLSX = require('xlsx');

// Load sales data CSV
console.log("Loading sales data...");
const salesCsv = fs.readFileSync('./sample_data/sales_data.csv', 'utf8');
const rows = salesCsv.split('\n');
const headers = rows[0].split(',');

// Parse into objects
const salesData = [];
for (let i = 1; i < rows.length; i++) {
  if (!rows[i].trim()) continue;
  const values = rows[i].split(',');
  const row = {};
  
  headers.forEach((header, index) => {
    // Try to parse numbers
    const val = values[index];
    if (!isNaN(val) && val.trim() !== '') {
      row[header] = parseFloat(val);
    } else {
      row[header] = val;
    }
  });
  
  salesData.push(row);
}

console.log(`Loaded ${salesData.length} sales records`);

// Find numeric columns
const numericColumns = headers.filter(col => {
  return salesData.some(row => typeof row[col] === 'number');
});

console.log("Numeric columns:", numericColumns);

// TRANSFORMATION 1: Statistical Summary
console.log("\n===== GENERATING STATISTICAL SUMMARY =====");

// Create workbook
const statWorkbook = XLSX.utils.book_new();

// Add raw data sheet
const rawDataSheet = XLSX.utils.json_to_sheet(salesData);
XLSX.utils.book_append_sheet(statWorkbook, rawDataSheet, 'Raw Data');

// Calculate statistics for each numeric column
const stats = numericColumns.map(col => {
  const values = salesData.map(row => row[col]).filter(val => !isNaN(val));
  
  // Basic statistics
  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Sort for median
  const sorted = [...values].sort((a, b) => a - b);
  const median = count % 2 === 0 
    ? (sorted[count/2 - 1] + sorted[count/2]) / 2 
    : sorted[Math.floor(count/2)];
  
  // Standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);
  
  return {
    column: col,
    count,
    min,
    max,
    sum,
    mean,
    median,
    stdDev
  };
});

// Create summary data
const summaryData = [
  ['Column', 'Count', 'Min', 'Max', 'Sum', 'Mean', 'Median', 'Std Dev']
];

stats.forEach(stat => {
  summaryData.push([
    stat.column,
    stat.count,
    stat.min,
    stat.max,
    stat.sum,
    stat.mean,
    stat.median,
    stat.stdDev
  ]);
});

// Add summary sheet
const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
XLSX.utils.book_append_sheet(statWorkbook, summarySheet, 'Summary Statistics');

// Write file
XLSX.writeFile(statWorkbook, './sample_data/statistical_summary_test.xlsx');
console.log("Created statistical summary: ./sample_data/statistical_summary_test.xlsx");

// TRANSFORMATION 2: Category Analysis
console.log("\n===== GENERATING CATEGORY ANALYSIS =====");

// Get categories
const categoryCol = 'category';
const categories = [...new Set(salesData.map(row => row[categoryCol]))];
console.log("Categories found:", categories);

// Create category workbook
const catWorkbook = XLSX.utils.book_new();

// Add raw data
XLSX.utils.book_append_sheet(catWorkbook, rawDataSheet, 'Raw Data');

// Group by category
const categoryGroups = {};
categories.forEach(cat => {
  categoryGroups[cat] = salesData.filter(row => row[categoryCol] === cat);
});

// Calculate category totals
const categoryData = [
  ['Category', 'Count', 'Total Value', 'Average Price', 'Min Price', 'Max Price', 'Total Quantity']
];

categories.forEach(cat => {
  const group = categoryGroups[cat];
  const count = group.length;
  const totalValue = group.reduce((sum, row) => sum + row.total_value, 0);
  const avgPrice = group.reduce((sum, row) => sum + row.price, 0) / count;
  const prices = group.map(row => row.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalQuantity = group.reduce((sum, row) => sum + row.quantity, 0);
  
  categoryData.push([
    cat,
    count,
    totalValue,
    avgPrice,
    minPrice,
    maxPrice,
    totalQuantity
  ]);
}); 

// Add category sheet
const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
XLSX.utils.book_append_sheet(catWorkbook, categorySheet, 'Category Analysis');

// Write file
XLSX.writeFile(catWorkbook, './sample_data/category_analysis_test.xlsx');
console.log("Created category analysis: ./sample_data/category_analysis_test.xlsx");

console.log("\nTransformation tests complete!");
