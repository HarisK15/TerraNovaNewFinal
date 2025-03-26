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
// import ChartComponent from './ChartComponent'; // will add this later

// component for showing query results 
// Todo: clean this up before submitting!

// supported formats
// todo; implement pdf
var formats = ['json', 'csv', 'excel'];  

//   function downloadStuff() {
//     // Todo: implement 
//   }

function QueryResults(props) {
  
  // make first letter capital
  var qt = props.queryType || 'sql';
  if(qt != null && qt != undefined) {
    if(qt.length > 0) {
      var firstChar = qt.charAt(0);
      var restChars = qt.slice(1);
      qt = firstChar.toUpperCase() + restChars;
    }
  }
  
  var rs = props.results;
  var cols = props.columns; 
  var qtype = props.queryType || 'sql';
  var queryCode = props.queryCode || '';
  var exportIntent = props.exportIntent;
  var exportFormat = props.exportFormat;
    var exportTemplateType = props.exportTemplateType;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  // might need later
  var debug = false;

  var numCols = cols.length;
          console.log("num cols:", numCols);
  
  // adding this for later
  var showExtraInfo = true;
  
  // no results
  var hasResults = false;
  if (rs != null && rs != undefined) {
    if (rs.length > 0) {
      hasResults = true;
    }
  }
  
  if (hasResults == false) {
      console.log("no results found");
    return (
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="body2" color="text.secondary">
          No results found for this query.
        </Typography>
      </Paper>
    );
  } else if (hasResults == true) {
      console.log("results found");
  }
  
  // var showChart = true; 
  /* 
  function handlePageChange(page) {
    setCurrentPage(page);
    var start = (page - 1) * pageSize;
    var end = page * pageSize;
    setVisibleData(data.slice(start, end));
  }
  */
  
// rendering data in table format
function renderDataTable() {
var tableData = [];
    for (var i = 0; i < rs.length; i++) {
        var row = [];
        for (var j = 0; j < cols.length; j++) {
            var cell = rs[i][cols[j]];
            if (cell == null || cell == undefined) {
                cell = '';
            }
row.push(cell);
      }
tableData.push(row);
    }
return (
  <div>
      <TableContainer 
        component={Paper} 
        sx={{ maxHeight: 400, 
        overflow: 'auto', 
        marginBottom: "10px" 
      }}>
        <Table 
          style={{width: "100%"}} 
          size="small">
              <TableHead style={{position: "sticky", top: 0, background: "#fff"}}>
                <TableRow>
          {cols.map((c, i) => 
                <TableCell key={i}>
                  <b>{c}</b>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map(function(r, i) {
              // style
              var rowStyle = {};
          
              /*
              if (i % 2 === 0) {
                rowStyle = { backgroundColor: '#f9f9f9' };
              }
              */

              return (
                <TableRow key={i} style={rowStyle}>
                  {r.map(function(c, j) {
                     // return a cell
                    return (
                      <TableCell 
                        key={j}
                      >
                        {c}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{
          height: "10px",
          width: "100%"
      }}></div>
    </div>
    );
  }

function renderQueryInfo() {
    var queryInfo = '';
    if (qt != null && qt != undefined) {
      queryInfo += qt + ' Query Results: ';
    }
if (rs != null && rs != undefined) {
      queryInfo += rs.length + ' rows found';
    }
    
// paper component with info
    var comp = <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
    <Typography 
        variant="subtitle2" 
        gutterBottom
    >
      {queryInfo}
    </Typography>
    
    {queryCode != null 
    && queryCode != undefined 
    && queryCode != "" ? 
    <Typography 
          variant="caption" 
          component="pre" 
          sx={{ 
          mt: 1, 
      p: 1.5, 
        bgcolor: '#f0f0f0', 
          borderRadius: 1,
      overflowX: 'auto',
          border: '1px solid #e0e0e0'
    }}
    >
        {queryCode}
      </Typography> : null}
  </Paper>;
    return comp;
  }

  return (
    <Box>
      <div className="visualization">
      <DataVisualization 
        results={rs} 
        columns={cols} 
      />
      </div>
      
      {/* sometimes we need queryinfo */}
      <div>
        {renderQueryInfo()}
      </div>

      {/* export buttons  */}
      <Box sx={{
         mb: 2, 
         display: 'flex', 
         justifyContent: 'flex-end', 
         gap: 1 
      }}>
      
        <Button
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => {
            console.log("Opening dialog");
            console.log("Results count:", rs ? rs.length : 0);
            // add more options 
            setDialogOpen(true);
          }}
          variant="contained"
color="primary"
        >
          Export Templates
        </Button>
        

        




        <Button
          size="small"
        startIcon={<DownloadIcon />}
          onClick={() => {
            console.log("Downloading as CSV");
            var str = "";
            for(var i = 0; i < cols.length; i++){
              str += cols[i];
              if(i < cols.length - 1) {
                str += ',';
              }
            }
            str += '\n';
            console.log("header done");
            for(var j = 0; j < rs.length; j++) {
              var rowData = rs[j];
              var rowStr = "";
              
              for(var k = 0; k < cols.length; k++) {
                var colName = cols[k];
                var val = rowData[colName];
                
                if (val == null || val == undefined) {
                  val = '';
                } else {
                  val = String(val);
                }
                
                if(val.indexOf(',') > -1) {
                  val = '"' + val + '"';
                }
                
                rowStr += val;
                if(k < cols.length - 1) {
                  rowStr += ',';
                }
              }
              
              str += rowStr + '\n';
            }
            
            var b = new Blob([str], {type: "text/csv"});
            var url = URL.createObjectURL(b);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'results.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // URL.revokeObjectURL(url); 
          }}
          variant="outlined"
        >
          CSV
        </Button>
        
        
        <Button
        size="small"
          startIcon={<DownloadIcon />}
          onClick={() => {
            var ws = XLSX.utils.json_to_sheet(rs);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, 'results.xlsx');
          }}
        variant="outlined"
        >
          Excel
        </Button>
        
        
        <Button
          size="small"
        startIcon={<DownloadIcon />}
          onClick={() => {
            // convert to json and download
            var j = JSON.stringify(rs, null, 2);
            var b = new Blob([j], {type: "application/json"});
            var l = document.createElement('a');
            l.href = URL.createObjectURL(b);
            l.download = 'results.json';
            l.click();
          }}
variant="outlined"
        >
          JSON
        </Button>
      </Box>
      
      <div id="results-table-container" className="results">
        {renderDataTable()}
      </div>
      

      <ExportTemplatesDialog
        open={dialogOpen}
        onClose={
          () => {
            setDialogOpen(false)
          }
        }
        results={rs}
        columns={cols}
        exportIntent={exportIntent}
        exportFormat={exportFormat} 
        exportTemplateType={exportTemplateType}
      />
    </Box>
  );
}

      {/*
      <div className="charts">
        {showCharts && (
          <div>
            <h3>Visualizations</h3>
            <BarChart data={rs} />  
          </div>
        )}
      </div>
      */}


// todo add sort
// todo add filtering
// todo fix bug with commas in csv
// todo implement pdf export
export default QueryResults;
