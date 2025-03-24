import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';

// purple colours
const Colours = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

// vizualization component
const DataVisualization = ({ results, columns }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState(''); 
  const [chartData, setChartData] = useState([]);
  const [shouldShowChart, setShouldShowChart] = useState(false);



  // tried using callback but  didn't work
  // check if the data is good for charts
  useEffect(() => {
    // check if data present
    if (!results ||results.length === 0||!columns ||columns.length===0) {
      setShouldShowChart(false);
      return;
    }
    // look for number columns
    let hasNumbers = false;
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      for (let j = 0; j < columns.length; j++) {
        let col = columns[j];
        if (!isNaN(row[col]) && row[col] !== null && row[col] !== '') {
          hasNumbers = true;
          break;
        }
      }
      if (hasNumbers) break;
    }

    // only show charts for small data with numbers
    if (results.length <= 10 && hasNumbers) {
      setShouldShowChart(true);
      
      // TODO: This is a bit messy but it works for now
      // try to pick some columns for the chart
      let numColumns = [];
      let textColumns = [];
      let row1 = results[0];
      for (let c = 0; c < columns.length; c++) {
        let colName = columns[c];
        // check if it's a number
        if (!isNaN(row1[colName]) && row1[colName] !== null) {
          numColumns.push(colName);
        } else {
          textColumns.push(colName);
        }
      }
      
      // pick axes based on what we have
      if (textColumns.length >= 1) {
        setXAxis(textColumns[0]);
        if (numColumns.length >= 1) {
          setYAxis(numColumns[0]);
        }
      } else {
        setXAxis('index');
        if (numColumns.length >= 1) {
          setYAxis(numColumns[0]);
        }
      }
    } else {
      setShouldShowChart(false);
    }
  }, [results, columns]);

  // make the chart data
  useEffect(() => {
    if (!results || !results.length || !xAxis || !yAxis) {
      setChartData([]);
      return;
    }

    // Todo:optimize
    let newData = [];
    // make data for chart
    for (let i = 0; i < results.length; i++) {
      let row = results[i];
      // still working on better labels for pie charts
      let name = '';
      if (xAxis === 'index') {
        name = 'Item ' + (i+1);
      } else {
        name = String(row[xAxis] || '');
      }
      // kept getting Nan error hence below code added
      let val = 0;
      if (!isNaN(row[yAxis])) {
        val = parseFloat(row[yAxis]);
      }

      let dataPoint = {
        name: name,
        value: val
      };
      for (let j = 0; j < columns.length; j++) {
        let col = columns[j];
        dataPoint[col] = row[col];
      }
      newData.push(dataPoint);
    }
    
    // limimit number of points
    setChartData(newData.slice(0, 20));
  }, [results, columns, xAxis, yAxis]);
  if (!shouldShowChart) {
    return null;
  }









  // handle changes below
  function handleChartTypeChange(event) {
    setChartType(event.target.value);
  }
  function handleXAxisChange(event) {
    setXAxis(event.target.value);
  }
  function handleYAxisChange(event) {
    setYAxis(event.target.value);
  }




  // Todo:
  // - Fix the pie chart labels
  // - Add export to PNG
  // - Add more chart types?



  
  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Visualization
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* dropdown for chart type */}
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

        {/* dropdown for x axis */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>X Axis</InputLabel>
          <Select
            value={xAxis}
            label="X Axis"
            onChange={handleXAxisChange}
          >
            {
              columns.map((col, i) => {
                return <MenuItem key={col + "-" + i} value={col}>{col}</MenuItem>
              })
            }
            <MenuItem value="index">Row Index</MenuItem>
          </Select>
        </FormControl>

        {/* dropdown for y axis */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Y Axis</InputLabel>
          <Select
            value={yAxis}
            label="Y Axis"
            onChange={handleYAxisChange}
          >
            {
              columns.map((col, i) => {
                return <MenuItem key={col + "-" + i} value={col}>{col}</MenuItem>
              })
            }
          </Select>
        </FormControl>
      </Box>

      {/* chart container */}
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
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={Colours[i % Colours.length]} />
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
