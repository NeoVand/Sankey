import { FC } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Typography,
  Stack
} from '@mui/material';

export type FormType = '10-K' | '10-Q' | '8-K' | 'ALL';
export type FilingPeriod = 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ALL';

interface FormSelectorProps {
  selectedForm: FormType;
  selectedPeriod: FilingPeriod;
  onFormChange: (form: FormType) => void;
  onPeriodChange: (period: FilingPeriod) => void;
  disabled?: boolean;
}

/**
 * Component for selecting SEC filing form types and periods
 */
export const FormSelector: FC<FormSelectorProps> = ({
  selectedForm,
  selectedPeriod,
  onFormChange,
  onPeriodChange,
  disabled = false
}) => {
  const handleFormChange = (event: SelectChangeEvent) => {
    onFormChange(event.target.value as FormType);
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    onPeriodChange(event.target.value as FilingPeriod);
  };

  return (
    <Stack 
      direction="row"
      spacing={1} 
      alignItems="center"
      sx={{ height: '32px' }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          fontSize: '0.75rem', 
          fontWeight: 500,
          display: { xs: 'none', sm: 'block' }
        }}
      >
        Filing:
      </Typography>
      
      <FormControl variant="outlined" size="small" sx={{ minWidth: 90, flexShrink: 0 }} disabled={disabled}>
        <Select
          value={selectedForm}
          onChange={handleFormChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Form Type' }}
          sx={{ height: '28px', fontSize: '0.75rem' }}
        >
          <MenuItem value="10-K">10-K (Annual)</MenuItem>
          <MenuItem value="10-Q">10-Q (Quarterly)</MenuItem>
          <MenuItem value="8-K">8-K (Events)</MenuItem>
          <MenuItem value="ALL">All Forms</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ minWidth: 80, flexShrink: 0 }}
        disabled={disabled || selectedForm !== '10-Q'}
      >
        <Select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Period' }}
          sx={{ height: '28px', fontSize: '0.75rem' }}
        >
          <MenuItem value="FY">Full Year</MenuItem>
          <MenuItem value="Q1">Q1</MenuItem>
          <MenuItem value="Q2">Q2</MenuItem>
          <MenuItem value="Q3">Q3</MenuItem>
          <MenuItem value="Q4">Q4</MenuItem>
          <MenuItem value="ALL">All</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}; 