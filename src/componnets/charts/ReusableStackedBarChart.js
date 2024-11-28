import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


const ReusableStackedBarChart = ({ title, categories, seriesData }) => {
    const config = {
        chart: {
            type: 'column',
            // width: 400,
        },
        title: {
            text: title,
        },
        xAxis: {
            categories: categories,
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total',
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: 'gray',
                },
            },
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            // x: 0,
            // y: 0,
            // floating: true,
        },
        plotOptions: {
            column: {
                stacking: 'normal', // Enable stacking
                dataLabels: {
                    enabled: true,
                    color: 'white', // Color of the data labels
                },
            },
        },
        credits: {
            enabled: false, // Disable the Highcharts watermark
        },
        series: seriesData,
    };

    return (
        <div className="chart-container" >

            <HighchartsReact highcharts={Highcharts} options={config} />
        </div>
    )
};

export default ReusableStackedBarChart