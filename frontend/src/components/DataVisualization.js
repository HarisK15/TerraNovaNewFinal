import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';

// Some colors I found online for the charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// This component creates visualizations from SQL query results
// Added for my dissertation project to make data analysis easier
const DataVisualization = ({ results, columns }) => {
  // State variables to control the chart
  const [chartType, setChartType] = useState('bar'); // default to bar chart
  const [xAxis, setXAxis] = useState(''); // column for X axis
  const [yAxis, setYAxis] = useState(''); // column for Y axis
  const [chartData, setChartData] = useState([]); // processed data for the chart
  const [shouldShowChart, setShouldShowChart] = useState(false); // whether to show the chart at all
  
  console.log("DataVisualization component rendering");
  console.log("Results:", results ? results.length : 0, "rows");
  console.log("Columns:", columns);
  
  // First check if we should show charts for this data
  useEffect(() => {
    console.log("Checking if data is suitable for visualization");
    
    // No data, no chart
    if (!results || results.length === 0 || !columns || columns.length === 0) {
      console.log("No data available for visualization");
      setShouldShowChart(false);
      return;
    }

    // We need to check if there's at least one number column to chart
    let hasNumericData = false;
    // Loop through some results to check for numbers
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      for (let j = 0; j < columns.length; j++) {
        let col = columns[j];
        if (!isNaN(row[col]) && row[col] !== null && row[col] !== '') {
          hasNumericData = true;
          break;
        }
      }
      if (hasNumericData) break;
    }

    // Small result sets with numbers are probably aggregation results
    // which are good for charts
    let isAggregationResult = results.length <= 10 && hasNumericData;
    
    console.log("Has numeric data:", hasNumericData);
    console.log("Is likely aggregation result:", isAggregationResult);
    
    setShouldShowChart(isAggregationResult);
    
    // Try to auto-select good columns for charts
    if (isAggregationResult) {
      // Find number columns and text columns
      let numericColumns = [];
      let nonNumericColumns = [];
      
      // Check the first row to categorize columns
      let firstRow = results[0];
      for (let i = 0; i < columns.length; i++) {
        let col = columns[i];
        if (!isNaN(firstRow[col]) && firstRow[col] !== null && firstRow[col] !== '') {
          numericColumns.push(col);
        } else {
          nonNumericColumns.push(col);
        }
      }
      
      console.log("Numeric columns:", numericColumns);
      console.log("Non-numeric columns:", nonNumericColumns);
      
      // Different scenarios for selecting axes
      if (nonNumericColumns.length > 0 && numericColumns.length > 0) {
        // Best case: we have both text and number columns
        setXAxis(nonNumericColumns[0]);
        setYAxis(numericColumns[0]);
        console.log("Selected text column for X and numeric for Y");
      } else if (numericColumns.length >= 2) {
        // Second best: we have multiple number columns
        setXAxis(numericColumns[0]);
        setYAxis(numericColumns[1]);
        console.log("Selected two numeric columns for X and Y");
      } else if (numericColumns.length === 1) {
        // Last resort: just one number column, use row index for X
        setXAxis('index');
        setYAxis(numericColumns[0]);
        console.log("Using row index for X and only numeric column for Y");
      }
    }
  }, [results, columns]);

  // Prepare the chart data whenever selected columns change
  useEffect(() => {
    console.log("Preparing chart data for axes:", xAxis, yAxis);
    
    if (!results || results.length === 0 || !xAxis || !yAxis) {
      console.log("Missing data or axes selection");
      setChartData([]);
      return;
    }

    // Format the data for the chart library
    let formattedData = [];
    
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      
      // Create an entry for this row
      let entry = {
        // If using index, generate a label, otherwise use the column value
        name: xAxis === 'index' ? `Item ${i + 1}` : String(row[xAxis] || `Item ${i + 1}`),
        // Make sure the value is a number
        value: parseFloat(row[yAxis]) || 0
      };
      
      // Add all other columns for tooltips
      for (let j = 0; j < columns.length; j++) {
        let col = columns[j];
        entry[col] = row[col];
      }
      
      formattedData.push(entry);
    }
    
    console.log("Formatted chart data:", formattedData);
    setChartData(formattedData);
  }, [results, columns, xAxis, yAxis]);

  // Don't render anything if we shouldn't show a chart
  if (!shouldShowChart) {
    console.log("Not showing visualization");
    return null;
  }

  // This function changes the chart type
  const handleChartTypeChange = (event) => {
    console.log("Changing chart type to:", event.target.value);
    setChartType(event.target.value);
  };
  
  // This function changes the X axis column
  const handleXAxisChange = (event) => {
    console.log("Changing X axis to:", event.target.value);
    setXAxis(event.target.value);
  };
  
  // This function changes the Y axis column
  const handleYAxisChange = (event) => {
    console.log("Changing Y axis to:", event.target.value);
    setYAxis(event.target.value);
  };

  // TODO: Add more chart types and options
  // TODO: Fix the tooltip formatting
  // TODO: Add option to export chart as image

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Visualization
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Chart type selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select
            value={chartType}
            label="Chart Type"
            onChange={handleChartTypeChange}
          >
            <MenuItem value="bar">Bar Chart</MenuItem>
            <MenuItem value="pie">Pie Chart</MenuItem>
            <MenuItem value="line">Line Chart</MenuItem>
          </Select>
        </FormControl>

        {/* X axis selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>X Axis</InputLabel>
          <Select
            value={xAxis}
            label="X Axis"
            onChange={handleXAxisChange}
          >
            {columns.map((col, index) => (
              <MenuItem key={col + "-" + index} value={col}>{col}</MenuItem>
            ))}
            <MenuItem value="index">Row Index</MenuItem>
          </Select>
        </FormControl>

        {/* Y axis selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Y Axis</InputLabel>
          <Select
            value={yAxis}
            label="Y Axis"
            onChange={handleYAxisChange}
          >
            {columns.map((col, index) => (
              <MenuItem key={col + "-" + index} value={col}>{col}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* This is where the chart is rendered */}
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          {/* Render different chart types based on selection */}
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name={yAxis} fill="#8884d8" />
            </BarChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {/* Add colors to pie slices */}
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name={yAxis} stroke="#8884d8" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DataVisualization;
