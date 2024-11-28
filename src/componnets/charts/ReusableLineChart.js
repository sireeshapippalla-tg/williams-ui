import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ReusableLineChart = ({ title, categories, seriesData }) => {
    const config = {
        chart: {
          type: 'line',
        },
        title: {
          text: title,
        },
        xAxis: {
          categories: categories,
        },
        yAxis: {
          title: {
            text: 'Value',
          },
        },
        series: seriesData,
      };
    
      return <HighchartsReact highcharts={Highcharts} options={config} />;
    };
    

export default ReusableLineChart