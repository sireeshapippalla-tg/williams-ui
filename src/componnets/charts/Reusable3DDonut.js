import React from 'react';
import Highcharts from 'highcharts';
import Highcharts3D from 'highcharts/highcharts-3d';
import HighchartsReact from 'highcharts-react-official';


// Initialize Highcharts 3D module
Highcharts3D(Highcharts);

const Reusable3DDonut = ({ title, data }) => {
    const config = {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45, // Tilt angle for 3D effect
                beta: 0,   // Rotation angle for 3D effect
                depth: 50, // Depth of the 3D chart
            },
            width: 380, // Custom width
            height: 400,
        },
        title: {
            text: title,
        },
        plotOptions: {
            pie: {
                innerSize: '50%', // Adjust the inner size for the donut width
                depth: 50, // Depth for 3D effect
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

    return (
        <div style={{  border:"1px solid #533529" }}>
            {/* Center the chart and set a custom width */}
            <HighchartsReact highcharts={Highcharts} options={config} />
        </div>
    );
};

export default Reusable3DDonut