/**
 * Export Templates
 * 
 * Templates for exporting data in different formats
 */

// Format date for filenames
const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Process filenames with date
const processFilename = (filename) => {
  // Replace the date placeholder with actual date
  if (filename.includes('{date}')) {
    return filename.replace('{date}', formatDate());
  }
  // Return unchanged if no placeholder found
  return filename;
};

// List of export templates
export const exportTemplates = [
  // CSV templates
  {
    id: 'csv-basic',
    name: 'Basic CSV',
    description: 'Simple CSV export with all columns',
    format: 'csv',
    filename: 'query-results-{date}.csv',
    category: 'general',
    type: 'basic',
    config: {
      includeHeader: true,
    }
  },
  {
    id: 'csv-excel-compatible',
    name: 'Excel-Compatible CSV',
    description: 'CSV formatted for Excel import',
    format: 'csv',
    filename: 'excel-import-{date}.csv',
    category: 'general',
    type: 'basic',
    config: {
      includeHeader: true,
      bom: true, // Add byte order mark for Excel
      delimiter: ',',
      encoding: 'utf-8'
    }
  },
  
  // Excel templates
  {
    id: 'excel-basic',
    name: 'Basic Excel',
    description: 'Simple Excel export with data in a single sheet',
    format: 'excel',
    filename: 'query-results-{date}.xlsx',
    category: 'general',
    type: 'basic',
    config: {
      sheetName: 'Data',
      includeHeader: true,
      autoFilter: true,
      freezeHeader: true
    }
  },
  
  // JSON templates
  {
    id: 'json-basic',
    name: 'Basic JSON',
    description: 'Simple JSON export of all data',
    format: 'json',
    filename: 'query-results-{date}.json',
    category: 'general',
    type: 'basic',
    config: {
      pretty: true, // Pretty print the JSON
      indentSize: 2
    }
  },
  {
    id: 'json-compact',
    name: 'Compact JSON',
    description: 'Compact JSON without whitespace',
    format: 'json',
    filename: 'query-results-compact-{date}.json',
    category: 'general',
    type: 'basic',
    config: {
      pretty: false // No pretty printing
    }
  }
];

// Helper function to find a template by ID
export const findTemplateById = (templateId) => {
  return exportTemplates.find(template => template.id === templateId);
};

// Prepare a template for export
export const prepareTemplate = (templateId, results, config = {}) => {
  // Find the template
  const foundTemplate = findTemplateById(templateId);
  
  if (!foundTemplate) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  // Create filename (replace spaces with underscores and add date)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  
  let filename;
  if (config.customFilename) {
    filename = `${config.customFilename}.${foundTemplate.format}`;
  } else {
    filename = `${foundTemplate.name.replace(/\s+/g, '_')}_${dateStr}.${foundTemplate.format}`;
  }
  
  // Return all the info needed for exporting
  return {
    template: foundTemplate,
    filename,
    config,
    data: results
  };
};

// Apply template to data
export const applyTemplate = (templateId, results, columns, customConfig = {}) => {
  // Get the basic template data
  const templateData = prepareTemplate(templateId, results, customConfig);
  
  // Extract needed values
  const { template } = templateData;
  
  // Merge the base config with any custom settings
  const config = {
    ...template.config,
    ...customConfig,
    category: template.category,
    type: template.type
  };
  
  // Process the filename
  const filename = processFilename(templateData.filename);
  
  // Return the full configuration
  return {
    template,
    filename,
    config,
    data: results
  };
};
