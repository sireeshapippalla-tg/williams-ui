import React, { useState, useEffect } from "react";
import { Typography, Autocomplete, TextField, Select, } from "@mui/material";
import ResuableCard from "../../componnets/ResuableCard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
// import ReusableChart from "../../componnets/ReusableChart";
import ReusableStackedBarChart from "../../componnets/charts/ReusableStackedBarChart";
import ReusablePieChart from "../../componnets/charts/ReusablePieChart";
import { getAllDepartments, getMastersListByType } from "../../api";
import Reusable3DColumnChart from "../../componnets/charts/Reusable3DColumnChart";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


const MainDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [severities, setSeverities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
 

  const stackedBarData = [
    { name: 'Open', data: [3, 6, 9, 1, 2] },
    { name: 'Inprogress', data: [5, 10, 15, 3, 3] },
    { name: 'Resolved', data: [5, 10, 15, 5, 4] },

  ];



  const pieData = [
    { name: 'category1', y: 40 },
    { name: 'category2', y: 30 },
    { name: 'category3', y: 20 },
    { name: 'category4', y: 10 },
    { name: 'category5', y: 30 },
    { name: 'category5', y: 70 },
  ];



  const severityCategories = ['Moderate', 'Low', 'High', 'Critical'];
  const seriesData = [
    {
      name: 'Severity', // Series name
      data: [10, 20, 30, 15], // Corresponding counts for Low, Medium, High, Critical
      colorByPoint: true, // Assign different colors automatically
    },
  ];




  useEffect(() => {
    fetchDepartments();
    fetchDropdownData();
  }, []);


  const fetchDropdownData = async () => {
    try {
      // Payloads for different dropdowns
      const payloads = [
        { sourceName: "Incident Source" },
        { sourceName: "Incident Severity" },
        { sourceName: "Incident Category" },
      ];

      // Make API calls sequentially or in parallel
      const [sourceResponse, severityResponse, categoryResponse] = await Promise.all(
        payloads.map((payload) => axios.post(getMastersListByType, payload))
      );

      // Process and set state for each dropdown
      const sourceList = sourceResponse?.data?.masterList?.map((source) => ({
        id: source.sourceId,
        title: source.sourceType,
      }));
      const severityList = severityResponse?.data?.masterList?.map((severity) => ({
        id: severity.sourceId,
        title: severity.sourceType,
      }));
      const categoryList = categoryResponse?.data?.masterList?.map((category) => ({
        id: category.sourceId,
        title: category.sourceType,
      }));

      setSources(sourceList);
      setSeverities(severityList);
      setCategories(categoryList);

      console.log("Sources:", sourceList);
      console.log("Severities:", severityList);
      console.log("Categories:", categoryList);
    } catch (error) {
      console.log(`Error in fetching dropdown data:`, error);
    }
  };


  // deparments

  const fetchDepartments = async () => {
    try {
      const payload = {
        orgId: 1,
      };
      const response = await axios.post(getAllDepartments, payload);
      console.log("response", response);
      const departmentList = response.data.map((dept) => ({
        id: dept.departmentID,
        title: dept.departmentName,
      }));
      setDepartments(departmentList);
      console.log("departments", departments)
    } catch (error) {
      console.log(`Error in fetching the Departments:`, error);
    }
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };


  // Source daropdown

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value)

  }

  const handleSeverityChange = (event) => {
    setSelectedSeverity(event.target.value)

  }
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)

  }

  return (
    <div>
      <div className="row mb-3">
        <div className="col-sm-12 col-md-12 col-lg-12">
          <Typography className="dashboard-header">Incident Details</Typography>
        </div>
      </div>

      <div className="row mb-2 p-3" style={{ backgroundColor: "#533529", margin: "1px" }}>
        <div className="col-sm-6 col-md-3 col-lg-3 incident-dashboard-count">
          <div className="total-icident-dashboard row" >
            <div className="col-md-12">
              <h5>Number of Incidents</h5>
            </div>
            <div className="col-md-12">
              <h4>10</h4>
            </div>
          </div>
        </div >
        <div className="col-sm-6 col-md-9 col-lg-9">
          <div className="row">
            <div className="col-sm-6 col-md-4 col-lg-4 mb-2">
              <div className="calendar_align">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="From Date" />
                </LocalizationProvider>
              </div>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 mb-2">
              <div className="calendar_align">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="To Date" />
                </LocalizationProvider>
              </div>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 mb-2">
              <div className="select-icon">
                <FormControl fullWidth >
                  <InputLabel style={{ color: "white" }} id="department-select-label">Department</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    label="Department"
                    style={{
                      color: 'white', // Set text color to white
                      border: '1px solid white',
                      backgroundColor: "#533529" // Set border color to white
                    }}

                  >
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 source-div">
              <div className="select-icon">
                <FormControl fullWidth >
                  <InputLabel style={{ color: "white" }} id="department-select-label">Source</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={selectedSource}
                    onChange={handleSourceChange}
                    label="Department"
                    style={{
                      color: 'white', // Set text color to white
                      border: '1px solid white',
                      backgroundColor: "#533529" // Set border color to white
                    }}

                  >
                    {sources.map((source) => (
                      <MenuItem key={source.id} value={source.id}>
                        {source.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              {/* </div> */}
            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 source-div">
              <div className="select-icon">
                <FormControl fullWidth >
                  <InputLabel style={{ color: "white" }} id="department-select-label">Severity</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={selectedSeverity}
                    onChange={handleSeverityChange}
                    label="Severity"
                    style={{
                      color: 'white', // Set text color to white
                      border: '1px solid white',
                      backgroundColor: "#533529" // Set border color to white
                    }}

                  >
                    {severities.map((severity) => (
                      <MenuItem key={severity.id} value={severity.id}>
                        {severity.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 source-div">
              <div className="select-icon">

                <FormControl fullWidth >
                  <InputLabel style={{ color: "white" }} id="department-select-label">Category</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    label="Category"
                    style={{
                      color: 'white', // Set text color to white
                      border: '1px solid white',
                      backgroundColor: "#533529" // Set border color to white
                    }}

                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>

        </div>
        {/* <div className="col-sm-6 col-md-3 col-lg-3 mb-2">
          <div className="row text-white" style={{ border: "1px solid white", margin:"auto", padding:"12px" }}>
            <div className="col-md-10">
              <h6>Number of Incidents</h6>
            </div>
            <div className="col-md-2">
              <h6>10</h6>
            </div>
          </div>
        </div> */}


      </div>

      <div className="row">

        <div className="col-sm-12 col-md-6 col-xl-6">
          <div>
            <h6 className="chart-header" >Incidents by Category</h6>
          </div>
          {/* <div className="chart-container"> */}
          <ReusablePieChart data={pieData} />
          {/* </div> */}
        </div>

      

        <div className="col-sm-12 col-md-6 col-xl-6">
          <div>
            <h6 className="chart-header" >Incidents By Severity Level</h6>
          </div>
          <Reusable3DColumnChart
            // title="3D Column Chart Example"
            categories={severityCategories}
            seriesData={seriesData}
          />
        </div>

        <div className="col-sm-12 col-md-12 col-xl-12">
          <div>
            <h6 className="chart-header" >Incidents By Department and Status</h6>
          </div>
          <ReusableStackedBarChart
            // title="Sales by Product"
            categories={['Human Resources', 'Accounts', 'IT Support', 'Retail', 'retail1']}
            seriesData={stackedBarData}
          />
        </div>

      </div>
    </div>


  );
};

export default MainDashboard;
