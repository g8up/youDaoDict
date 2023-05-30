import * as React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from "react-router-dom";

import History from './Pages/History';
import Setting from './Pages/Setting/setting';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import './App.less';

export default function () {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Router>
      <nav>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="导航">
            <Tab label="配置选项" value={0} component={RouterLink} to="/"/>
            <Tab label="查询历史" value={1} component={RouterLink} to="/history"/>
          </Tabs>
        </Box>
      </nav>

      <Box sx={{ width: '100%' }} className="content">
        <Routes>
          <Route path="/" element={<Setting />}> </Route>
          <Route path="/history" element={<History />}> </Route>
        </Routes>
      </Box>
    </Router>
  );
};