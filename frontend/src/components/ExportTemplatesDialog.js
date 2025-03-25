import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Tabs, Tab, List, ListItem, 
  ListItemButton, ListItemText, Box, Divider, Chip,
  TextField, Switch, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, 
} from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView'; 
import CodeIcon from '@mui/icons-material/Code'; 
import FileOpenIcon from '@mui/icons-material/FileOpen';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InsightsIcon from '@mui/icons-material/Insights';
import CategoryIcon from '@mui/icons-material/Category';
import DownloadIcon from '@mui/icons-material/Download';
import { exportTemplates, getTemplatesByFormat, getTemplatesByCategory, getTemplatesByFormatAndCategory, getCategories } from '../utils/exportTemplates';
import { processAndExport } from '../utils/templateProcessor';
import { getFormatIcon } from '../utils/formatIcons';

// own function due to inline not working
function getCategoryIcon(category) {
  if (category === 'financial') {
    return <AttachMoneyIcon />;
  } else if (category === 'analysis') {
    return <InsightsIcon />;
  } else if (category === 'visualization') {
    return <BarChartIcon />;
  } else if (category === 'general') {
    return <CategoryIcon />;
  } else {
    // Default icon - should add more icons later
    return <CategoryIcon />;
  }
}

// Dialog for picking export templates
const ExportTemplatesDialog = (props) => {
  // todo:destructure
  const open = props.open;
  const handleClose = props.handleClose;
  const results = props.results;
  const columns = props.columns;
  const exportFormat = props.exportFormat;
  const exportTemplateType = props.exportType;
  
  const [currTemplate, setcurrTemplate] = useState(null);
  const [currFormat, setcurrFormat] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [myConfig, setmyConfig] = useState({});
  const [customFilename, setCustomFilename] = useState('');
  const [tabValue, setTabValue] = useState('format');
  // Todo: dark mode
  // not implemented yet
  const [isDarkMode, setIsDarkMode] = useState(false); 
  
  // auto-select format if provided
  useEffect(() => {
    if (open && exportFormat) {
      setcurrFormat(exportFormat.toLowerCase());
      
      // just grab the first template of this format
      const tmpls = exportTemplates.filter(t => 
        t.format === exportFormat.toLowerCase()
      );
      
      if (tmpls.length > 0) {
        setcurrTemplate(tmpls[0]);
      }
    }
  }, [open, exportFormat, exportTemplateType]);
  
  // Group templates by format
  const templatesByFormat = {};
  for (let i = 0; i < exportTemplates.length; i++) {
    let tmpl = exportTemplates[i];
    let fmt = tmpl.format;
    if (!templatesByFormat[fmt]) {
      templatesByFormat[fmt] = [];
    }
    templatesByFormat[fmt].push(tmpl);
  }
  
  // Tried to use .reduce but couldn't get it to work
  let templatesByCategory = {};
  exportTemplates.forEach(tmpl => {
    if (!templatesByCategory[tmpl.category]) {
      templatesByCategory[tmpl.category] = [];
    }
    templatesByCategory[tmpl.category].push(tmpl);
  });
  
  // Select a template
  function handleTemplateSelect(tmpl) {
    setcurrTemplate(tmpl);
    setmyConfig({});
    setCustomFilename('');
    console.log('template:' + tmpl.name);
  }
  
  function doExport() {
    let configToUse = { ...myConfig };
    if (customFilename) {
      configToUse.customFilename = customFilename;
    }
    
      processAndExport(
        currTemplate.id,
        results,
        columns,
        configToUse
      );
      
      console.log('Export worked!');
    handleClose();
  }

  const testTemplate = () => {
    console.log('Testing template:', currTemplate.id);
    alert("Test feature not implemented yet!");
  }
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Export Templates
      </DialogTitle>
      
      <DialogContent>
        <div style={{ display: 'flex', height: '400px' }}>
          {/* Left side */}
          <div style={{ width: '35%', borderRight: '1px solid #eee', paddingRight: '16px', overflowY: 'auto' }}>
            <Tabs value={tabValue} onChange={(event, newValue) => {
              setTabValue(newValue);
            }}>
              <Tab label="By Format" value="format" />
              <Tab label="By Category" value="category" />
            </Tabs>
            
            {/* Format tab */}
            {tabValue === 'format' && (
              <div>
                <Typography variant="subtitle1" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                  Export Format
                </Typography>
                
                <List>
                  {Object.keys(templatesByFormat).map((fmt) => (
                    <ListItem key={fmt} disablePadding>
                      <ListItemButton 
                        selected={currFormat === fmt}
                        onClick={() => {
                          setcurrFormat(fmt);
                          setcurrTemplate(templatesByFormat[fmt][0]);
                          setmyConfig({});
                        }}
                        style={{marginBottom: '4px'}}
                      >
                        {getFormatIcon(fmt)}
                        <ListItemText primary={fmt.toUpperCase()} style={{marginLeft: '8px'}} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                {currFormat && (
                  <div>
                    <Divider style={{margin: '16px 0'}} />
                    
                    <Typography variant="subtitle1" style={{marginBottom: '8px', fontWeight: 'bold'}}>
                      {currFormat.toUpperCase()} Templates
                    </Typography>
                    
                    <List>
                      {templatesByFormat[currFormat].map((tmpl) => (
                        <ListItem key={tmpl.id} disablePadding>
                          <ListItemButton
                            selected={currTemplate && currTemplate.id === tmpl.id}
                            onClick={() => handleTemplateSelect(tmpl)}
                          >
                            <div>
                              <div>{tmpl.name}</div>
                              <div style={{fontSize: '0.8rem', color: '#666'}}>{tmpl.description}</div>
                            </div>
                            <Chip 
                              label={tmpl.category} 
                              size="small" 
                              style={{marginLeft: '8px'}}
                              icon={getCategoryIcon(tmpl.category)}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                )}
              </div>
            )}
            
            {/* Category tab */}
            {tabValue === 'category' && (
              <div>
                <Typography variant="subtitle1" style={{marginTop: '16px', marginBottom: '8px', fontWeight: 'bold'}}>
                  Template Category
                </Typography>
                
                <Typography variant="body2" style={{marginTop: '16px', color: '#666'}}>
                  Category filtering still in development
                </Typography>
                
                {/* Todo: uncomment when working working 
                <div>
                  {Object.keys(templatesByCategory).map((category) => (
                    <div key={category}>
                      <h4>{category}</h4>
                      <ul>
                        {templatesByCategory[category].map(tmpl => (
                          <li key={tmpl.id} onClick={() => handleTemplateSelect(tmpl)}>
                            {tmpl.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                */}
              </div>
            )}
          </div>
          
          {/* Right side */}
          <div style={{width: '65%', paddingLeft: '16px', overflow: 'auto'}}>
            {currTemplate ? (
              <div>
                <Typography variant="h6">
                  {currTemplate.name}
                </Typography>
                
                <Typography variant="body2" style={{marginTop: '8px', marginBottom: '16px', color: '#666'}}>
                  {currTemplate.description}
                </Typography>
                
                <Divider style={{margin: '16px 0'}} />
                
                <Typography variant="subtitle1" style={{marginBottom: '16px', fontWeight: 'bold'}}>
                  Template Options
                </Typography>
                
                {/* Custom filename */}
                <div style={{marginBottom: '24px'}}>
                  <TextField
                    label="Custom Filename"
                    size="small"
                    fullWidth
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    helperText="Leave blank for auto-generated filename"
                  />
                </div>
                
                {/* Template-specific options */}
                {currTemplate.config && Object.keys(currTemplate.config).map((optKey) => {
                  const opt = currTemplate.config[optKey];
                  
                  if (opt.type === 'boolean') {
                    return (
                      <FormControlLabel
                        key={optKey}
                        control={
                          <Switch
                            checked={myConfig[optKey] === true}
                            onChange={(e) => {
                              let newConfig = { ...myConfig };
                              newConfig[optKey] = e.target.checked;
                              setmyConfig(newConfig);
                            }}
                          />
                        }
                        label={opt.label || optKey}
                      />
                    );
                  } else if (opt.type === 'select' && opt.options) {
                    return (
                      <div key={optKey} style={{marginBottom: '16px'}}>
                        <InputLabel>{opt.label || optKey}</InputLabel>
                        <Select
                          value={myConfig[optKey] || opt.default || ''}
                          onChange={(e) => {
                              let newConfig = { ...myConfig };
                              newConfig[optKey] = e.target.value;
                              setmyConfig(newConfig);
                          }}
                          label={opt.label || optKey}
                          fullWidth
                          size="small"
                        >
                          {opt.options.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    );
                  } else {
                    return (
                      <TextField
                        key={optKey}
                        label={opt.label || optKey}
                        size="small"
                        fullWidth
                        style={{marginBottom: '16px'}}
                        value={myConfig[optKey] || opt.default || ''}
                        onChange={(e) => {
                          let newConfig = { ...myConfig };
                          newConfig[optKey] = e.target.value;
                          setmyConfig(newConfig);
                        }}
                        helperText={opt.helperText}
                      />
                    );
                  }
                })}
                
                <div style={{marginTop: '24px'}}>
                  <Button 
                    variant="outlined" 
                    onClick={testTemplate}
                    disabled={!currTemplate}
                    style={{marginRight: '16px'}}
                  >
                    Test Template
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Typography>
                  Select a template to view details
                </Typography>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={doExport} 
          variant="contained" 
          disabled={!currTemplate}
        >
          Export <DownloadIcon style={{marginLeft: '8px'}} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ExportTemplatesDialog;


// fix stack error when on page for too long