import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';
import CodeIcon from '@mui/icons-material/Code';

// This function returns the right icon for each export format
export const getFormatIcon = (format) => {
  // Convert to lowercase just in case
  const formatLower = format.toLowerCase();
  
  // Check which format we have
  if (formatLower === 'csv') {
    // CSV gets a document icon
    return <DescriptionIcon />;
  } else if (formatLower === 'excel') {
    // Excel gets a table icon
    return <TableViewIcon />;
  } else if (formatLower === 'json') {
    // JSON gets a code icon
    return <CodeIcon />;
  } else {
    // If we don't recognize the format, default to document icon
    console.log('Unknown format:', format);
    return <DescriptionIcon />;
  }
};
