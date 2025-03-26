import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, List, ListItem, 
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
import { exportTemplates } from '../utils/exportTemplates';
import { processAndExport } from '../utils/templateProcessor';
import { getFormatIcon } from '../utils/formatIcons';

// own function due to inline not working
function get_cat_icon(category) {
  // TODO: rewrite this using a switch statment?? 
  let icon_type = null;
  
  if (category === 'financial') {
    //console.log('financial icon loaded')
    icon_type = <AttachMoneyIcon />;
    return icon_type;
  } else if (category === 'analysis') {
    // todo: use different icon
    return <InsightsIcon />;
  } else if (category === 'visualization') {
    //this one looks bad on dark theme
    let vizIcon = <BarChartIcon />; 
    // console.log(category, vizIcon)
    return vizIcon
  } else if (category === 'general') {
    return <CategoryIcon />;
  } else {
    // Default icon - should add more icons later
    // TODO: add more icons for: reporting, data, etc.
    return <CategoryIcon />;
  }
}

// refactor
function getCategoryIcon(cat) {
  return get_cat_icon(cat);
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
  const [myConfig, setmyConfig] = useState({});
  const [customFilename, setCustomFilename] = useState('');
  // Todo: dark mode
  // not implemented yet
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [dialogOpen, setDialogOpen] = useState(open); 
  
  // auto-select format if provided
  useEffect(() => {
    // old way of doing it but it works
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
  
  // Select a template
  function pickTemplate(tmpl) {
    setcurrTemplate(tmpl);
      setmyConfig({});
    setCustomFilename('');
    //Todo: add beter error handling for template selection
    console.log('template:' + tmpl.name);
    
    // not implemented yet
    // let recents = localStorage.getItem('recent_templates') || '[]';
    // try {
    //   let recentsArray = JSON.parse(recents);
    //   recentsArray = [tmpl.id, ...recentsArray.filter(id => id !== tmpl.id)].slice(0, 5);
    //   localStorage.setItem('recent_templates', JSON.stringify(recentsArray));
    // } catch (e) {
    //   console.error('Failed to update recent templates');
    // }
  
  }
  
  const doExport = () => {
      console.log('Exporting with template:', currTemplate.id);
      
      // Start the export process
      let configToUse = { ...myConfig };
      if (customFilename) {
        configToUse.customFilename = customFilename;
      }
      
      try {
        processAndExport(
          currTemplate.id,
          results,
          columns,
          configToUse
        );
        
        console.log('Export worked!');
        // safety check because kept getting handleClose not defined error after exporting
        if (typeof handleClose === 'function') {
          handleClose();
        } else {
          console.warn('handleClose not defined, using fallback method');
          // Fallback - directly set open state if possible
          setDialogOpen(false);
        }
      } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed: ' + (err.message || 'Unknown error'));
      }
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
                      console.log(currFormat)
                      // for (let t of templatesByFormat[fmt]) {
                      //   console.log(t.id, t.name);
                      // }
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
                        onClick={() => pickTemplate(tmpl)}
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
          
          {/* Right side */}
          <div style={{ width: '65%', padding: '0 0 0 16px', overflowY: 'auto' }}>
            {currTemplate ? (
              <div className="template-details">
                {/* Todo: maybe add preview of export here */}
                <Typography variant="h6" style={{marginTop: '8px'}}>
                  {currTemplate.name}
                </Typography>
                <Typography variant="body2" style={{marginBottom: '16px', color: '#666'}}>
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
                  // Skip these Excel options since they're already enabled by default
                  if (currTemplate.format === 'excel' && 
                      (optKey === 'freezeHeader' || 
                       optKey === 'autoFilter' || 
                       optKey === 'includeHeader')) {
                    return null;
                  }
                  
                  const opt = currTemplate.config[optKey];
                  const val = opt; 
                  
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
          style={{ backgroundColor: "#1976d2" }}
        >
          Export <DownloadIcon style={{marginLeft: '8px'}} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ExportTemplatesDialog;

// fix stack error when on page for too long