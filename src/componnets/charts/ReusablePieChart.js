// import React from 'react';
// import Highcharts from 'highcharts';
// import Highcharts3D from 'highcharts/highcharts-3d';
// import HighchartsReact from 'highcharts-react-official';

// Highcharts3D(Highcharts);


// const ReusablePieChart = ({ title, data }) => {
//     const config = {
//         chart: {
//             type: 'pie',
//             options3d: {
//                 enabled: true,
//                 alpha: 45, // Tilt angle for 3D effect
//                 beta: 0,   // Rotation angle
//             },
//             // width: 400, // Custom width
//             width: null,
//             height: 400, // Custom height
//         },
//         title: {
//             text: title,
//         },
//         plotOptions: {
//             pie: {
//                 allowPointSelect: true,
//                 cursor: 'pointer',
//                 depth: 45, // Depth for 3D effect
//                 dataLabels: {
//                     enabled: true,
//                     format: '{point.name}: {point.percentage:.1f}%',
//                 },
//             },
//         },
//         series: [
//             {
//                 name: 'Data',
//                 data: data,
//             },
//         ],
//         credits: {
//             enabled: false, // Disable the Highcharts watermark
//         },

//     };

//     return (
//         <div style={{border:"1px solid #533529", margin: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center'  }}>
//             {/* Center the chart and set a custom width */}
//             <HighchartsReact highcharts={Highcharts} options={config} />
//         </div>
//     );
// };


// export default ReusablePieChart

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ReusablePieChart = ({ title, data }) => {
    const config = {
        chart: {
            type: 'pie',
            // width: width,    // Dynamic width based on props or default to '100%'
            // height: height,  // Dynamic height based on props or default to 400
        },
        title: {
            text: title,
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.percentage:.1f}%', // Percentage format
                },
            },
        },
        series: [
            {
                name: 'Data',
                data: data,
            },
        ],
        credits: {
            enabled: false,  // Disable the Highcharts watermark
        },
        
    };

    return (
        <div className="chart-container">
            <HighchartsReact highcharts={Highcharts} options={config} />
        </div>
    );
};

export default ReusablePieChart;
