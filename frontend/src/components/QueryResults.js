import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Tooltip,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import * as XLSX from 'xlsx';
import DataVisualization from './DataVisualization';
import ExportTemplatesDialog from './ExportTemplatesDialog';

// This component shows the results of a query and allows exporting
// It's a key part of my dissertation project for data exporting templates
function QueryResults({ 
  results, 
  columns, 
  queryType = 'sql', 
  queryCode = '', 
  exportIntent,
  exportFormat, 
  exportTemplateType
}) {
  // Store whether the export dialog is open or not
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Function to open the export dialog
  const handleOpenExportDialog = () => {
    console.log("Opening export dialog with format:", exportFormat);
    console.log("Template type:", exportTemplateType);
    console.log("Results count:", results ? results.length : 0);
    console.log("Columns:", columns);
    setExportDialogOpen(true);
  };

  // Function to close the export dialog
  const handleCloseExportDialog = () => {
    console.log("Closing export dialog");
    setExportDialogOpen(false);
  };

  // Check if we have results
  if (!results || results.length === 0) {
    console.log("No results found for the query");
    return (
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="body2" color="text.secondary">
          No results found for this query.
        </Typography>
      </Paper>
    );
  }
  
  // Format the query type label (capitalize first letter)
  let queryTypeLabel;
  if (queryType) {
    queryTypeLabel = queryType.charAt(0).toUpperCase() + queryType.slice(1);
  } else {
    queryTypeLabel = 'SQL';
  }
  console.log("Query type:", queryTypeLabel);

  // Function to download the results as JSON
  const downloadAsJson = () => {
    console.log("Downloading results as JSON");
    
    // Convert the results to a JSON string
    const dataStr = JSON.stringify(results, null, 2);
    
    // Create a blob with the data
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(dataBlob);
    
    // Create a link element and click it to download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query_results.json';
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log("JSON download complete");
  };

  // Function to download the results as CSV
  const downloadAsCsv = () => {
    console.log("Downloading results as CSV");
    
    // Create CSV header row
    const csvHeader = columns.join(',') + '\n';
    console.log("CSV header created");

    // Create CSV rows by iterating through results
    let csvRows = '';
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      let rowValues = [];
      
      // Process each column in the row
      for (let j = 0; j < columns.length; j++) {
        let column = columns[j];
        // Handle values that need quoting (contain commas, quotes, or newlines)
        let value = row[column];
        let valueStr = '';
        
        // Convert to string and handle null/undefined
        if (value === null || value === undefined) {
          valueStr = '';
        } else {
          valueStr = String(value);
        }
        
        // Escape values with special characters
        if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
          valueStr = '"' + valueStr.replace(/"/g, '""') + '"'; // Escape quotes with double quotes
        }
        
        rowValues.push(valueStr);
      }
      
      // Add the row to our CSV content
      csvRows += rowValues.join(',') + '\n';
    }

    // Combine header and rows
    const csvContent = csvHeader + csvRows;
    console.log("CSV content created, length:", csvContent.length);
    
    // Create a blob and download link
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query_results.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    console.log("CSV download complete");
  };

  // Function to download the results as Excel
  const downloadAsExcel = () => {
    console.log("Downloading results as Excel");
    
    try {
      // Convert results to worksheet format
      const worksheet = XLSX.utils.json_to_sheet(results);
      console.log("Worksheet created");
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
      console.log("Workbook created with sheet added");
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, 'query_results.xlsx');
      console.log("Excel file downloaded");
    } catch (error) {
      console.error("Error creating Excel file:", error);
      alert("Failed to create Excel file: " + error.message);
    }
  };

  // TODO: Add function to export multiple sheets in one Excel file
  // TODO: Add function to customize column headers before export

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {/* Export Templates button */}
        <Tooltip title="Export with Templates">
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={handleOpenExportDialog}
            variant="contained"
            color="primary"
          >
            Export Templates
          </Button>
        </Tooltip>
        
        {/* CSV export button */}
        <Tooltip title="Download as CSV">
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadAsCsv}
            variant="outlined"
          >
            CSV
          </Button>
        </Tooltip>
        
        {/* Excel export button */}
        <Tooltip title="Download as Excel">
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadAsExcel}
            variant="outlined"
            color="success"
          >
            Excel
          </Button>
        </Tooltip>
        
        {/* JSON export button */}
        <Tooltip title="Download as JSON">
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadAsJson}
            variant="outlined"
          >
            JSON
          </Button>
        </Tooltip>
      </Box>
      
      {/* Table to display the results */}
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          {/* Table header with column names */}
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={column + '-' + index} sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          {/* Table body with data */}
          <TableBody>
            {results.map((row, rowIndex) => (
              <TableRow key={'row-' + rowIndex} hover>
                {columns.map((column, colIndex) => (
                  <TableCell key={`${rowIndex}-${column}-${colIndex}`}>
                    {row[column] !== null && row[column] !== undefined ? String(row[column]) : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Display record count */}
      {results.length > 0 && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
          {results.length} record{results.length !== 1 ? 's' : ''} found
        </Typography>
      )}
      
      {/* Data Visualization Component - for charts and graphs */}
      <DataVisualization results={results} columns={columns} />
      
      {/* Export Templates Dialog - This is a separate component for exporting with templates */}
      {exportDialogOpen && (
        <ExportTemplatesDialog 
          open={exportDialogOpen} 
          handleClose={handleCloseExportDialog} 
          results={results} 
          columns={columns}
          exportFormat={exportFormat}
          exportTemplateType={exportTemplateType}
        />
      )}
    </Box>
  );
}

export default QueryResults;
