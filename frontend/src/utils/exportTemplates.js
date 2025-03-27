const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const processFilename = (filename) => {
  // Replace the date placeholder with actual date
  if (filename.includes('{date}')) {
    return filename.replace('{date}', formatDate());
  }
  return filename;
};

export const exportTemplates = [
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
      bom: true, 
      delimiter: ',',
      encoding: 'utf-8'
    }
  },
  
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
  
  {
    id: 'json-basic',
    name: 'Basic JSON',
    description: 'Simple JSON export of all data',
    format: 'json',
    filename: 'query-results-{date}.json',
    category: 'general',
    type: 'basic',
    config: {
      pretty: true, 
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
      pretty: false 
    }
  }
];

//find a template by ID
export const findTemplateById = (templateId) => {
  return exportTemplates.find(template => template.id === templateId);
};

// Prepare template for export
export const prepareTemplate = (templateId, results, config = {}) => {
  const foundTemplate = findTemplateById(templateId);
  
  if (!foundTemplate) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  
  // Map format names to correct file extensions
  const formatExtensions = {
    'csv': 'csv',
    'excel': 'xlsx',
    'json': 'json'
  };
  
  // Get the correct extension or fallback to the format name
  const extension = formatExtensions[foundTemplate.format] || foundTemplate.format;
  
  let filename;
  if (config.customFilename) {
    filename = `${config.customFilename}.${extension}`;
  } else {
    filename = `${foundTemplate.name.replace(/\s+/g, '_')}_${dateStr}.${extension}`;
  }
  
  return {
    template: foundTemplate,
    filename,
    config,
    data: results
  };
};

// Apply template to data
export const applyTemplate = (templateId, results, columns, customConfig = {}) => {
  const templateData = prepareTemplate(templateId, results, customConfig);
  const { template } = templateData;
  
  // Merge the base config with any custom settings
  const config = {
    ...template.config,
    ...customConfig,
    category: template.category,
    type: template.type
  };
  const filename = processFilename(templateData.filename);
  return {
    template,
    filename,
    config,
    data: results
  };
};
