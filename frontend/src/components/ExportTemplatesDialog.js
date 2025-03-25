import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Tabs, Tab, List, ListItem, 
  ListItemButton, ListItemText, Box, Divider, Chip,
  TextField, Switch, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, ListItemIcon
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

// icons for categories
function getCategoryIcon(category) {
  // tried using switch but this is easier to read
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
  const open = props.open;
  const handleClose = props.handleClose;
  const results = props.results;
  const columns = props.columns;
  const exportFormat = props.exportFormat;
  const exportTemplateType = props.exportType;
  
  // all my states - probably too many but they work
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customConfig, setCustomConfig] = useState({});
  const [customFilename, setCustomFilename] = useState('');
  const [tabValue, setTabValue] = useState('format');
  
  useEffect(() => {
    if (open) {
      // debug stuff
      // console.log("Dialog opened with:");
      // console.log("- Results length:", results?.length || 0);
      // console.log("- First few results:", results?.slice(0, 3) || []);
      // console.log("- Columns:", columns);
      // console.log("- Has data:", results && results.length > 0);
      // console.log("- Format:", exportFormat);
      // console.log("- Template type:", exportTemplateType);
      // !!!! remove these logs before pushing
    }
  }, [open, results, columns, exportFormat, exportTemplateType]);
  
  // try to auto-pick the right template
  useEffect(() => {
    if (open) {
      if (exportFormat) {
        let formatToUse = exportFormat.toLowerCase();
        
        // make sure it's valid - should probably use a constant list instead
        if (formatToUse === 'csv' || formatToUse === 'excel' || formatToUse === 'json') {
          setSelectedFormat(formatToUse);
          // todo: use utils func
          let goodTemplates = [];
          for (let i = 0; i < exportTemplates.length; i++) {
            let template = exportTemplates[i];
            
            if (template.format === formatToUse) {
              if (!exportTemplateType || template.type === exportTemplateType) {
                goodTemplates.push(template);
              }
            }
          }
          
          // just pick first one
          if (goodTemplates.length > 0) {
            setSelectedTemplate(goodTemplates[0]);
          }
        }
      }
    }
  }, [open, exportFormat, exportTemplateType]);
  
  // organize templates by format -inefficient but works
  let templatesByFormat = {};
  for (let i = 0; i < exportTemplates.length; i++) {
    let template = exportTemplates[i];
    let format = template.format;
    if (!templatesByFormat[format]) {
      templatesByFormat[format] = [];
    }
    templatesByFormat[format].push(template);
  }
  
  // organize templates by category 
  let templatesByCategory = {};
  for (let i = 0; i < exportTemplates.length; i++) {
    let template = exportTemplates[i];
    let category = template.category;
    if (!templatesByCategory[category]) {
      templatesByCategory[category] = [];
    }
    templatesByCategory[category].push(template);
  }
  
  function handleTemplateSelect(template) {
    // console.log("Selected template:", template.name);
    setSelectedTemplate(template);
    setCustomConfig({});
    setCustomFilename('');
  }
  
  // for custom options 
  function handleConfigChange(key, value) {
    // avoid React issues
    let newConfig = { ...customConfig };
    newConfig[key] = value;
    setCustomConfig(newConfig);
  }
  
  // run actual export 
  function handleExport() {
    if (!selectedTemplate) {
      console.log("No template selected");
      return;
    }
    // add filename if they entered one 
    let configToUse = { ...customConfig };
    if (customFilename) {
      configToUse.customFilename = customFilename;
    }
    
    const result = processAndExport(
      selectedTemplate.id,
      results,
      columns,
      configToUse
    );
    console.log('Export worked!', result);
    handleClose();
  }

  // Todo: Fix this, - unreliable with large datasets
  // Currently disabled for most templates 
  const handleTestTemplate = () => {
    if (!selectedTemplate) {
      console.log("No template selected for testing");
      return;
    }
    console.log('=== DIRECT TEST ===');
    console.log('Testing template:', selectedTemplate.id);
    alert("Test feature not fully implemented yet!");
    
    // Old approach - was causing browser to crash


  }
  
  //UI part - bunch of MaterialUI stuff
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Export Templates
        <Typography variant="subtitle2" color="text.secondary">
          Choose a template to format your exported data
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', height: '400px' }}>
          {/* Left side where you pick templates */}
          <Box sx={{ width: '35%', borderRight: '1px solid #eee', pr: 2, overflowY: 'auto' }}>
            <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
              <Tab label="By Format" value="format" />
              <Tab label="By Category" value="category" />
            </Tabs>
            
            {/* Format tab */}
            {tabValue === 'format' ? (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Export Format
                </Typography>
                
                <List dense>
                  {Object.keys(templatesByFormat).map((format) => (
                    <ListItem key={format} disablePadding>
                      <ListItemButton 
                        selected={selectedFormat === format}
                        onClick={() => {
                          setSelectedFormat(format);
                          // auto-pick first one if nothing selected
                          if (!selectedTemplate || selectedTemplate.format !== format) {
                            if (templatesByFormat[format].length > 0) {
                              setSelectedTemplate(templatesByFormat[format][0]);
                              setCustomConfig({});
                            }
                          }
                        }}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: selectedFormat === format ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          {getFormatIcon(format)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={format.toUpperCase()} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                {selectedFormat && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {selectedFormat.toUpperCase()} Templates
                    </Typography>
                    
                    <List dense>
                      {templatesByFormat[selectedFormat].map((template) => (
                        <ListItem key={template.id} disablePadding>
                          <ListItemButton
                            selected={selectedTemplate && selectedTemplate.id === template.id}
                            onClick={() => handleTemplateSelect(template)}
                            sx={{ 
                              borderRadius: 1, 
                              mb: 0.5,
                              bgcolor: selectedTemplate && selectedTemplate.id === template.id 
                                ? 'rgba(25, 118, 210, 0.12)' 
                                : 'transparent'
                            }}
                          >
                            <ListItemText 
                              primary={template.name}
                              secondary={template.description}
                            />
                            <Chip 
                              label={template.category} 
                              size="small" 
                              sx={{ ml: 1 }}
                              icon={getCategoryIcon(template.category)}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Template Category
                </Typography>
                
                {/* Category selection - WIP */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Category filtering still in development
                </Typography>
                
                {/*
                <List dense>
                  {Object.keys(templatesByCategory).map((category) => (
                    <ListItem key={category} disablePadding>
                      <ListItemButton 
                        selected={selectedCategory === category}
                        onClick={() => {
                          setSelectedCategory(category);
                          // auto-pick first one in category
                          if (!selectedTemplate || selectedTemplate.category !== category) {
                            if (templatesByCategory[category].length > 0) {
                              setSelectedTemplate(templatesByCategory[category][0]);
                              setCustomConfig({});
                            }
                          }
                        }}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5
                        }}
                      >
                        <ListItemIcon>
                          {getCategoryIcon(category)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={category.charAt(0).toUpperCase() + category.slice(1)}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                */}
              </>
            )}
          </Box>
          
          {/* Right side for template details */}
          <Box sx={{ width: '65%', pl: 2, overflow: 'auto' }}>
            {selectedTemplate ? (
              <>
                <Typography variant="h6">
                  {selectedTemplate.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {selectedTemplate.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* This is where template config goes */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Template Options
                </Typography>
                
                {/* Custom filename for any template */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Custom Filename"
                    size="small"
                    fullWidth
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    helperText="Leave blank for auto-generated filename"
                  />
                </Box>
                
                {/* Options specific to this template */}
                {selectedTemplate.config && Object.keys(selectedTemplate.config).map((optionKey) => {
                  const option = selectedTemplate.config[optionKey];
                  
                  // Different controls based on type
                  if (option.type === 'boolean') {
                    // Switch for boolean options
                    return (
                      <FormControlLabel
                        key={optionKey}
                        control={
                          <Switch
                            checked={customConfig[optionKey] === true}
                            onChange={(e) => handleConfigChange(optionKey, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={option.label || optionKey}
                      />
                    );
                  } else if (option.type === 'select' && option.options) {
                    // Dropdown for options list
                    return (
                      <FormControl key={optionKey} fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>{option.label || optionKey}</InputLabel>
                        <Select
                          value={customConfig[optionKey] || option.default || ''}
                          onChange={(e) => handleConfigChange(optionKey, e.target.value)}
                          label={option.label || optionKey}
                        >
                          {option.options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  } else {
                    // Default to text field for everything else
                    return (
                      <TextField
                        key={optionKey}
                        label={option.label || optionKey}
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={customConfig[optionKey] || option.default || ''}
                        onChange={(e) => handleConfigChange(optionKey, e.target.value)}
                        type={option.type === 'number' ? 'number' : 'text'}
                      />
                    );
                  }
                })}
                
                {/* TODO: Preview feature not implemented yet */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Preview not available yet
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%'
              }}>
                <Typography variant="body1" color="text.secondary">
                  Select a template to view options
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        
        {/* Test button - still working on this feature */}
        {selectedTemplate && selectedTemplate.testable && (
          <Button
            onClick={handleTestTemplate}
            color="secondary"
            variant="outlined"
            sx={{ mr: 1 }}
            startIcon={<BarChartIcon />}
          >
            Test
          </Button>
        )}
        
        <Button
          onClick={handleExport}
          color="primary"
          variant="contained"
          disabled={!selectedTemplate}
          startIcon={<DownloadIcon />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportTemplatesDialog;
