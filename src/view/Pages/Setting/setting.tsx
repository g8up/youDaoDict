import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function () {
  const [value, setValue] = React.useState([]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="不在这些网站触发划词翻译"
            multiline
            rows={5}
            defaultValue={value.join('\n')}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleChange} variant="contained">保存</Button>
        </Grid>
      </Grid>

    </Box>
  )
}