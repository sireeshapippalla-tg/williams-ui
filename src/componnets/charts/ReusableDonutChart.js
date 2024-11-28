import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


const ReusableDonutChart = ({ title, data }) => {
    const config = {
        chart: {
          type: 'pie',
        },
        title: {
          text: title,
        },
        plotOptions: {
          pie: {
            innerSize: '50%', // For donut effect
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.percentage:.1f}%',
            },
          },
        },
        series: [
          {
            name: 'Data',
            data: data,
          },
        ],
      };
    
      return <HighchartsReact highcharts={Highcharts} options={config} />;
    };
    

export default ReusableDonutChart