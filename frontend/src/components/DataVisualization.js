import React, { useState, useEffect, useRef } from 'react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Button } from '@mui/material';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';

// purply colours
const clrs = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

//visualization component
const DataVisualization = ({ results, columns }) => {
const [graphType, setGraphType] = useState('bar');
const [xAxis, setXAxis] = useState('');
const [y_axis, set_y_axis] = useState(''); 
  const [data, setData] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
const chartRef = useRef(null);


// tried using callback but  didn't work
  // check if the data is good for charts
  useEffect(() => {
    if (!results ||results.length === 0||!columns ||columns.length===0) {
      setShowGraph(false);
      return;
    }
    let gotNums = false;
    for (let i = 0; i < results.length; i++) {
      let r = results[i];
      for (let j = 0; j < columns.length; j++) {
        let c = columns[j];
        if (!isNaN(r[c]) && r[c] !== null && r[c] !== '') {
          gotNums = true;
          break;
        }
      }
      if (gotNums) break;
    }

    // only show charts for small data with numbers
    if (results.length <= 10 && gotNums) {
      setShowGraph(true);
      
      // Todo: This is a bit messy but it works for now
      // pick some columns for the chart
      let numCols = [];
      let txtCols = [];
      let r1 = results[0];
for (let c = 0; c < columns.length; c++) {
        let colName = columns[c];
        if (!isNaN(r1[colName]) && r1[colName] !== null) {
          numCols.push(colName);
        } else {
          txtCols.push(colName);
        }
      }
      
      // pick axes based on what we have
      if (txtCols.length >= 1) {
        setXAxis(txtCols[0]);
        if (numCols.length >= 1) {
          set_y_axis(numCols[0]);
        }
      } else {
        setXAxis('index');
        if (numCols.length >= 1) {
          set_y_axis(numCols[0]);
        }
      }
    } else {
      setShowGraph(false);
    }
  }, [results, columns]);


  // make the chart data
  useEffect(() => {
    if (!results || !results.length || !xAxis || !y_axis) {
      setData([]);
      return;
    }

    // Todo:optimize
    let newStuff = [];
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
      if (!isNaN(row[y_axis])) {
        val = parseFloat(row[y_axis]);
      }
      let pt = {
        name: name,
        value: val
      };
for (let j = 0; j < columns.length; j++) {
        let col = columns[j];
        pt[col] = row[col];
      }
      newStuff.push(pt);
    }
    
    // limit number of points
    setData(newStuff.slice(0, 20));
  }, [results, columns, xAxis, y_axis]);
  
  
  if (!showGraph) {
    return null;
  }

  // export chart as PNG using html2canvas
  function saveAsPNG() {
    if (!chartRef.current) {
      return;
    }
    html2canvas(chartRef.current).then(canvas => {
      //temporary link
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `chart-${graphType}-${new Date().getTime()}.png`;
      a.click();
    }).catch(err => {
      console.log("Error", err);
    });
  }


  function changeGraphType(event) {
    setGraphType(event.target.value);
  }
  function handleXAxisChange(event) {setXAxis(event.target.value);}
  function changeYAxis(event) {
    set_y_axis(event.target.value);
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
            value={graphType}
            label="Chart Type"
            onChange={changeGraphType}
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
            value={y_axis}
            label="Y Axis"
            onChange={changeYAxis}
          >
            {
              columns.map((col, i) => {
                return <MenuItem key={col + "-" + i} value={col}>{col}</MenuItem>
              })
            }
          </Select>
        </FormControl>
        
        {/* new export button */}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={saveAsPNG}
          startIcon={<DownloadIcon />}
        >
          Save as PNG
        </Button>
      </Box>

      <Box sx={{ height: 350, maxWidth: '100%', overflowX: 'auto' }} ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          {graphType === 'bar' && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={y_axis} />
            </BarChart>
          )}

          {graphType === 'pie' && (
            <PieChart>
              <Pie
                data={data}
                nameKey="name"
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={clrs[index % clrs.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend/>
            </PieChart>
          )}

          {graphType === 'line' && (
            <LineChart data={data}> 
              <CartesianGrid strokeDasharray="3 3" /> 
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name={y_axis} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DataVisualization;
