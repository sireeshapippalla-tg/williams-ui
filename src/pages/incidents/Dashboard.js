import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import IncidentDashboard from '../IncidentDashboard';
import PowerBi from './PowerBi';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
const Dashboard = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        // <div className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Power BI Dashboard" {...a11yProps(0)} />
                        <Tab label="AI Dashboard" {...a11yProps(1)} />
                       
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <PowerBi/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <IncidentDashboard/>
                </CustomTabPanel>
            </Box>
        // </div>
    )
}

export default Dashboard