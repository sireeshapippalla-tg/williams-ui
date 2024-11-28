import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_3D from 'highcharts/highcharts-3d';

// Initialize the 3D module
HC_3D(Highcharts);

const Reusable3DColumnChart = ({ title, categories, seriesData }) => {
    const config = {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 10, // Tilt angle
                beta: 15,  // Rotation angle
                depth: 50, // Depth of the 3D effect
                viewDistance: 25, // Distance from the viewer
            },
            // width: 400,  // Custom width
            // height: 400, // Custom height
        },
        title: {
            text: title,
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
            },
        },
        xAxis: {
            categories: categories,
            // title: {
            //     text: 'Categories',
            // },
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Values',
            },
        },
        plotOptions: {
            column: {
                depth: 25, // Individual column depth
            },
        },
        credits: {
            enabled: false,
        },
        series: seriesData,
    };

    return (
        <div className="chart-container">
            <HighchartsReact highcharts={Highcharts} options={config} />
        </div>
    );
}

export default Reusable3DColumnChart