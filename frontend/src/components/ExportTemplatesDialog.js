import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Divider,
  Box,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';
import CodeIcon from '@mui/icons-material/Code';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InsightsIcon from '@mui/icons-material/Insights';
import CategoryIcon from '@mui/icons-material/Category';
import { exportTemplates, getTemplatesByFormat, getTemplatesByCategory, getTemplatesByFormatAndCategory, getCategories } from '../utils/exportTemplates';
import { processAndExport } from '../utils/templateProcessor';
import { getFormatIcon } from '../utils/formatIcons';
import { testStatisticalSummary, testCategoryAnalysis } from '../test-templates';

// Function to get the right icon for each category
function getCategoryIcon(category) {
  // Return different icons based on category
  if (category === 'financial') {
    return <AttachMoneyIcon />;
  } else if (category === 'analysis') {
    return <InsightsIcon />;
  } else if (category === 'visualization') {
    return <BarChartIcon />;
  } else if (category === 'general') {
    return <CategoryIcon />;
  } else {
    // Default case
    return <CategoryIcon />;
  }
}

// Main component
const ExportTemplatesDialog = (props) => {
  // Extract props
  const open = props.open;
  const handleClose = props.handleClose;
  const results = props.results;
  const columns = props.columns;
  const exportFormat = props.exportFormat;
  const exportTemplateType = props.exportTemplateType;
  
  // State variables
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customConfig, setCustomConfig] = useState({});
  const [customFilename, setCustomFilename] = useState('');
  const [tabValue, setTabValue] = useState('format');
  
  // Log data when dialog opens
  useEffect(() => {
    if (open) {
      // Print debug info
      console.log("Dialog opened with:");
      console.log("- Results length:", results?.length || 0);
      console.log("- First few results:", results?.slice(0, 3) || []);
      console.log("- Columns:", columns);
      console.log("- Has data:", results && results.length > 0);
      console.log("- Format:", exportFormat);
      console.log("- Template type:", exportTemplateType);
    }
  }, [open, results, columns, exportFormat, exportTemplateType]);
  
  // Auto-select format and template when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Trying to auto-select format:", exportFormat);
      
      // Check if format is valid
      if (exportFormat) {
        let format = exportFormat.toLowerCase();
        
        // Make sure it's one of our supported formats
        if (format === 'csv' || format === 'excel' || format === 'json') {
          console.log(`Setting format to ${format}`);
          setSelectedFormat(format);
          
          // Find templates that match our format and template type
          let matchingTemplates = [];
          
          // Loop through all templates
          for (let i = 0; i < exportTemplates.length; i++) {
            let template = exportTemplates[i];
            
            // Check if format matches
            if (template.format === format) {
              // Check template type if specified
              if (!exportTemplateType || template.type === exportTemplateType) {
                matchingTemplates.push(template);
              }
            }
          }
          
          // Select the first matching template if any
          if (matchingTemplates.length > 0) {
            console.log(`Auto-selecting template: ${matchingTemplates[0].name}`);
            setSelectedTemplate(matchingTemplates[0]);
          }
        }
      }
    }
  }, [open, exportFormat, exportTemplateType]);
  
  // Group templates by format
  let groupedTemplatesByFormat = {};
  
  // Loop through templates and group by format
  for (let i = 0; i < exportTemplates.length; i++) {
    let template = exportTemplates[i];
    let format = template.format;
    
    // Create array for format if doesn't exist
    if (!groupedTemplatesByFormat[format]) {
      groupedTemplatesByFormat[format] = [];
    }
    
    // Add template to the group
    groupedTemplatesByFormat[format].push(template);
  }
  
  // Group templates by category
  let groupedTemplatesByCategory = {};
  
  // Loop through templates and group by category
  for (let i = 0; i < exportTemplates.length; i++) {
    let template = exportTemplates[i];
    let category = template.category;
    
    // Create array for category if doesn't exist
    if (!groupedTemplatesByCategory[category]) {
      groupedTemplatesByCategory[category] = [];
    }
    
    // Add template to the group
    groupedTemplatesByCategory[category].push(template);
  }
  
  // Handle template selection
  function handleTemplateSelect(template) {
    console.log("Selected template:", template.name);
    setSelectedTemplate(template);
    // Reset custom options when template changes
    setCustomConfig({});
    setCustomFilename('');
  }
  
  // Update custom config
  function handleConfigChange(key, value) {
    // Create a new object with updated value
    let newConfig = { ...customConfig };
    newConfig[key] = value;
    setCustomConfig(newConfig);
  }
  
  // Handle export button click
  function handleExport() {
    // Don't do anything if no template selected
    if (!selectedTemplate) {
      console.log("No template selected");
      return;
    }
    
    // Debug info
    console.log('=== EXPORT DEBUG INFO ===');
    console.log('Template:', selectedTemplate);
    console.log('Template ID:', selectedTemplate.id);
    console.log('Category:', selectedTemplate.category);
    console.log('Type:', selectedTemplate.type);
    console.log('Format:', selectedTemplate.format);
    console.log('Custom config:', customConfig);
    console.log('Data sample:', results.slice(0, 2));
    console.log('Columns:', columns);
    
    // Add custom filename if provided
    let finalConfig = { ...customConfig };
    if (customFilename) {
      finalConfig.customFilename = customFilename;
    }
    
    // Try to process and export
    try {
      // Call the export function
      const result = processAndExport(
        selectedTemplate.id,
        results,
        columns,
        finalConfig
      );
      
      console.log('Export succeeded:', result);
      
      // Close dialog
      handleClose();
    } catch (error) {
      // Show error
      console.error('Export failed:', error);
      alert(`Error: ${error.message}`);
    }
  }

  // Test the template with sample data
  function handleTestTemplate() {
    // Don't do anything if no template selected
    if (!selectedTemplate) {
      console.log("No template selected for testing");
      return;
    }
    
    console.log('=== DIRECT TEST ===');
    console.log('Testing template:', selectedTemplate.id);
    
    // Load sample data
    import('../utils/sampleData').then(module => {
      // Get the sample data
      const sampleData = module.default;
      console.log('Sample data loaded:', sampleData.slice(0, 2));
      
      // Get columns from first row
      const sampleColumns = Object.keys(sampleData[0]);
      console.log('Sample columns:', sampleColumns);
      
      try {
        // Import the transformation function
        const { processTransformation } = require('../utils/templateProcessor');
        
        // Process the transformation
        const transformedData = processTransformation(
          selectedTemplate.id,
          sampleData,
          sampleColumns,
          {
            category: selectedTemplate.category,
            type: selectedTemplate.type,
            format: selectedTemplate.format,
            ...selectedTemplate.config,
            directTest: true
          }
        );
        
        console.log('Transformation result:', transformedData);
        
        // Generate a test file
        if (transformedData) {
          const XLSX = require('xlsx');
          const workbook = XLSX.utils.book_new();
          
          // Add sheet with sample data
          const rawDataSheet = XLSX.utils.json_to_sheet(sampleData);
          XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
          
          // Add sheets for transformed data
          if (transformedData.summaryData) {
            const summarySheet = XLSX.utils.aoa_to_sheet(transformedData.summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Statistics');
          }
          
          if (transformedData.categoryData) {
            const categorySheet = XLSX.utils.aoa_to_sheet(transformedData.categoryData);
            XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Analysis');
          }
          
          if (transformedData.periodData) {
            const periodSheet = XLSX.utils.aoa_to_sheet(transformedData.periodData);
            XLSX.utils.book_append_sheet(workbook, periodSheet, 'Period Analysis');
          }
          
          // Generate filename and save
          const filename = `${selectedTemplate.name.replace(/\s+/g, '_')}_test.xlsx`;
          XLSX.writeFile(workbook, filename);
          console.log('Test file created:', filename);
          
          alert(`Test file created: ${filename}`);
        }
      } catch (error) {
        console.error('Test failed:', error);
        alert(`Error: ${error.message}`);
      }
    }).catch(error => {
      console.error('Failed to load sample data:', error);
      alert('Failed to load sample data for testing');
    });
  }
  
  // JSX for the component
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
          {/* Left side - template selection */}
          <Box sx={{ width: '35%', borderRight: '1px solid #eee', pr: 2, overflowY: 'auto' }}>
            <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
              <Tab label="By Format" value="format" />
              <Tab label="By Category" value="category" />
            </Tabs>
            
            {/* Format based organization */}
            {tabValue === 'format' ? (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Export Format
                </Typography>
                
                <List dense>
                  {Object.keys(groupedTemplatesByFormat).map((format) => (
                    <ListItem key={format} disablePadding>
                      <ListItemButton 
                        selected={selectedFormat === format}
                        onClick={() => {
                          setSelectedFormat(format);
                          // Auto-select first template if none selected
                          if (!selectedTemplate || selectedTemplate.format !== format) {
                            if (groupedTemplatesByFormat[format].length > 0) {
                              setSelectedTemplate(groupedTemplatesByFormat[format][0]);
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
                
                <Divider sx={{ my: 2 }} />
                
                {/* Show templates for selected format */}
                {selectedFormat && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {selectedFormat.toUpperCase()} Templates
                    </Typography>
                    <List dense>
                      {groupedTemplatesByFormat[selectedFormat].map((template) => (
                        <ListItem key={template.id} disablePadding>
                          <ListItemButton 
                            selected={selectedTemplate?.id === template.id}
                            onClick={() => handleTemplateSelect(template)}
                            sx={{ 
                              borderRadius: 1,
                              mb: 0.5,
                              bgcolor: selectedTemplate?.id === template.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                            }}
                          >
                            <ListItemText 
                              primary={template.name} 
                              secondary={template.description}
                            />
                            {template.type && (
                              <Chip 
                                label={template.type} 
                                size="small" 
                                variant="outlined" 
                                sx={{ ml: 1 }} 
                              />
                            )}
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
                  Categories
                </Typography>
                
                <List dense>
                  {Object.keys(groupedTemplatesByCategory).map((category) => (
                    <ListItem key={category} disablePadding>
                      <ListItemButton 
                        selected={selectedCategory === category}
                        onClick={() => {
                          setSelectedCategory(category);
                          // Auto-select first template if none selected
                          if (!selectedTemplate || selectedTemplate.category !== category) {
                            if (groupedTemplatesByCategory[category].length > 0) {
                              setSelectedTemplate(groupedTemplatesByCategory[category][0]);
                              setCustomConfig({});
                            }
                          }
                        }}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: selectedCategory === category ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          {getCategoryIcon(category)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={category} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Show templates for selected category */}
                {selectedCategory && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {selectedCategory} Templates
                    </Typography>
                    <List dense>
                      {groupedTemplatesByCategory[selectedCategory].map((template) => (
                        <ListItem key={template.id} disablePadding>
                          <ListItemButton 
                            selected={selectedTemplate?.id === template.id}
                            onClick={() => handleTemplateSelect(template)}
                            sx={{ 
                              borderRadius: 1,
                              mb: 0.5, 
                              bgcolor: selectedTemplate?.id === template.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                            }}
                          >
                            <ListItemIcon>
                              {getFormatIcon(template.format)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={template.name} 
                              secondary={template.description}
                            />
                            {template.type && (
                              <Chip 
                                label={template.type} 
                                size="small" 
                                variant="outlined" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Box>
          
          {/* Right side - template details */}
          <Box sx={{ width: '65%', pl: 2, overflowY: 'auto' }}>
            {selectedTemplate ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedTemplate.name}
                  <Chip 
                    label={selectedTemplate.format.toUpperCase()} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                  {selectedTemplate.category && (
                    <Chip 
                      label={selectedTemplate.category} 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Typography>
                
                <Typography paragraph>{selectedTemplate.description}</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Custom filename input */}
                <Typography variant="subtitle1" gutterBottom>Custom Filename (optional)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Default: ${selectedTemplate.filename}`}
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  margin="normal"
                  helperText="Enter a custom filename without extension"
                />
                
                {/* Template-specific options */}
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Template Options
                </Typography>
                
                {selectedTemplate.format === 'excel' && (
                  <Box>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.addTitle ?? selectedTemplate.config?.addTitle ?? false} 
                          onChange={(e) => handleConfigChange('addTitle', e.target.checked)}
                        />
                      } 
                      label="Include Title" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.addDatetime ?? selectedTemplate.config?.addDatetime ?? false} 
                          onChange={(e) => handleConfigChange('addDatetime', e.target.checked)}
                        />
                      } 
                      label="Include Date/Time" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.addFilters ?? selectedTemplate.config?.addFilters ?? false} 
                          onChange={(e) => handleConfigChange('addFilters', e.target.checked)}
                        />
                      } 
                      label="Add Column Filters" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.formatNumbers ?? selectedTemplate.config?.formatNumbers ?? false} 
                          onChange={(e) => handleConfigChange('formatNumbers', e.target.checked)}
                        />
                      } 
                      label="Format Numbers" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.addTotalRow ?? selectedTemplate.config?.addTotalRow ?? false} 
                          onChange={(e) => handleConfigChange('addTotalRow', e.target.checked)}
                        />
                      } 
                      label="Add Total Row" 
                    />
                  </Box>
                )}
                
                {selectedTemplate.format === 'csv' && (
                  <Box>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.includeHeader ?? selectedTemplate.config?.includeHeader ?? true} 
                          onChange={(e) => handleConfigChange('includeHeader', e.target.checked)}
                        />
                      } 
                      label="Include Header Row" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.bom ?? selectedTemplate.config?.bom ?? false} 
                          onChange={(e) => handleConfigChange('bom', e.target.checked)}
                        />
                      } 
                      label="Add BOM (for Excel compatibility)" 
                    />
                    <br />
                    <TextField
                      label="Delimiter"
                      size="small"
                      value={customConfig.delimiter ?? selectedTemplate.config?.delimiter ?? ','}
                      onChange={(e) => handleConfigChange('delimiter', e.target.value)}
                      sx={{ mt: 1, width: '100px' }}
                    />
                  </Box>
                )}
                
                {selectedTemplate.format === 'json' && (
                  <Box>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.pretty ?? selectedTemplate.config?.pretty ?? true} 
                          onChange={(e) => handleConfigChange('pretty', e.target.checked)}
                        />
                      } 
                      label="Pretty Print (Indented)" 
                    />
                    <br />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={customConfig.addMetadata ?? selectedTemplate.config?.addMetadata ?? false} 
                          onChange={(e) => handleConfigChange('addMetadata', e.target.checked)}
                        />
                      } 
                      label="Include Metadata" 
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a template from the left to see options
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
        {selectedTemplate && (
          <Button 
            onClick={handleTestTemplate}
            color="secondary"
            startIcon={<InsightsIcon />}
            sx={{ mr: 1 }}
          >
            Direct Test
          </Button>
        )}
        <Button 
          onClick={handleExport}
          disabled={!selectedTemplate || !results || results.length === 0}
          variant="contained" 
          color="primary"
          startIcon={<DownloadIcon />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportTemplatesDialog;
