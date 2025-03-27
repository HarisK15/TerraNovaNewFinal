import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';
import CodeIcon from '@mui/icons-material/Code';

//returns icons based on format
export const getFormatIcon = (format) => {
  const formatLower = format.toLowerCase();
  
  if (formatLower === 'csv') {
    return <DescriptionIcon />;
  } else if (formatLower === 'excel') {
    return <TableViewIcon />;
  } else if (formatLower === 'json') {
    return <CodeIcon />;
  } else {
    //default to document icon
    console.log('Unknown format:', format);
    return <DescriptionIcon />;
  }
};
