import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';

// Colours for chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// Creates visualizations from query results
const DataVisualization = ({ results, columns }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState(''); 
  const [chartData, setChartData] = useState([]);
  const [shouldShowChart, setShouldShowChart] = useState(false);
  
  // Check if cahrt can be shown for the data
  useEffect(() => {
    // No data, no chart
    if (!results || results.length === 0 || !columns || columns.length === 0) {
      setShouldShowChart(false);
      return;
    }
    let hasNumericData = false;
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
    setShouldShowChart(results.length <= 10 && hasNumericData);
    
    // pick some colums for chart
    if (results.length <= 10 && hasNumericData) {
      let numericColumns = [];
      let textColumns = [];
      
      let firstRow = results[0];
      for (let col of columns) {
        if (!isNaN(firstRow[col]) && firstRow[col] !== null && firstRow[col] !== '') {
          numericColumns.push(col);
        } else {
          textColumns.push(col);
        }
      }
      
      // Pick something for x/y so the chart shows up
      if (textColumns.length > 0) {
        setXAxis(textColumns[0]);
        if (numericColumns.length > 0) {
          setYAxis(numericColumns[0]);
        }
      } else if (numericColumns.length > 0) {
        setYAxis(numericColumns[0]);
        setXAxis('index');
      }
    }
  }, [results, columns]);

  // Create the chart data
  useEffect(() => {
    if (!results|| results.length=== 0|| !xAxis||!yAxis) {
      setChartData([]);
      return;
    }

    // Format data for charts
    let data = [];
    
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      let entry = {
        name: xAxis === 'index' ? `Item ${i + 1}` : String(row[xAxis] || `Item ${i + 1}`),
        value: parseFloat(row[yAxis]) || 0
      };
      
      // Add other columns for tooltips
      for (let col of columns) {
        entry[col] = row[col];
      }
      
      data.push(entry);
    }
    
    setChartData(data);
  }, [results, columns, xAxis, yAxis]);

  // Don't show anything if we shouldn't
  if (!shouldShowChart) {
    return null;
  }

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };
  
  const handleXAxisChange = (event) => {
    setXAxis(event.target.value);
  };
  
  const handleYAxisChange = (event) => {
    setYAxis(event.target.value);
  };

  // TODO: Add more chart types
  // TODO: Fix tooltips
  // TODO: Add export

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

      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={yAxis} />
            </BarChart>
          )}

          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}

          {chartType === 'line' && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name={yAxis} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DataVisualization;
