import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import useDebounce from '../helpers/Debouncer'
import { FilterValues, Range } from '../types'

export default function Filters(props: { setFilters: (filters: FilterValues) => void}) {
  const { setFilters } = props;
  const [values, setValues] = React.useState<FilterValues>({
    robot_gen: '',
    robot_name: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    elapsed_minutes_range: [0, 30]
  });

  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value

    // Handle all of our frontend sanitization for bad filter inputs
    if (event.target.id === "robot_gen" && parseInt(event.target.value) < 0) {
      newValue = "0";
    }

    setValues({
      ...values,
      [event.target.id]: newValue
    })
  };
  

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    let range: Range = (typeof newValue === 'number') ? [newValue, newValue] : [newValue[0], newValue[1]];

    setValues({
      ...values,
      elapsed_minutes_range: range
    });
  };

  React.useEffect(useDebounce(() => {
    setFilters(values);
  }, 350), [values])

  return (
    <>
    <Box m={2}>
      <Typography variant="h4" component="h4">
        Filters
      </Typography>
    </Box>
    <Box>
    <Grid container spacing={2} m={2}>
      <Grid item xs={5}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="robot_name"
          label="Robot Name"
          type="text"
          value={values.robot_name}       
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="start_date"
          label="Start Date"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          value={values.start_date} 
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="start_time"
          label="Start Time"
          type="time"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
          value={values.start_time} 
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="robot_gen"
          label="Robot Gen"
          type="number"
          InputProps={{
            inputProps: { 
                max: 100, min: 0 
            }
          }}
          value={values.robot_gen}   
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="end_date"
          label="End Date"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          value={values.end_date} 
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          onChange={handleTextFieldChange}
          fullWidth={true}
          id="end_time"
          label="End Time"
          type="time"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
          value={values.end_time} 
        />
      </Grid>
      <Grid item xs={11} mt={4}>
        <Typography id="input-slider" gutterBottom>
          Elapsed Time
        </Typography>
        <Slider
          key="rangeSlider" /* Suppresses a warning from mui */
          onChange={handleSliderChange}
          value={values.elapsed_minutes_range}
          valueLabelDisplay="auto"
          min={0}
          max={30}
        />
      </Grid>
    </Grid>
    </Box>
    </>
  )
}