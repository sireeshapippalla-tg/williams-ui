// ReusableChart.js
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ReusableChart = ({ chartOptions }) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default ReusableChart;
