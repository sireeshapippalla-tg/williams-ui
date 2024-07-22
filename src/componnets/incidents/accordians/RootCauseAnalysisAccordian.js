import React from 'react';
import { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Form from 'react-bootstrap/Form';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const RootCauseAnalysisAccordian = () => {
    const [whyInputs, setWhyInputs] = useState([
        { label: 'First Why', value: ['', '', ''] },
    ]);
    const [problemDescription, setProblemDescription] = useState('');
    const [rootSelectedFiles, setRootSelectedFiles] = useState([]);
    function numberToWords(number) {
        const units = [
            '',
            'First',
            'Second',
            'Third',
            'Forth',
            'Fifth',
            'Sixth',
            'Seventh',
            'Eighth',
            'Ninth',
        ];
        const teens = [
            'Tenth',
            'Eleventh',
            'Twelveth',
            'Thirteenth',
            'Fourteenth',
            'Fifteenth',
            'Sixteenth',
            'Seventeenth',
            'Eighteenth',
            'Nineteenth',
        ];
        const tens = [
            '',
            '',
            'Twentyth',
            'Thirtyth',
            'Fortyth',
            'Fiftyth',
            'Sixtyth',
            'Seventyth',
            'Eightyth',
            'Ninetyth',
        ];

        if (number < 10) {
            return units[number];
        } else if (number < 20) {
            return teens[number - 10];
        } else if (number < 100) {
            return `${tens[Math.floor(number / 10)]} ${units[number % 10]}`.trim();
        } else {
            return number.toString();
        }
    }

    const whyInputshandleAddRow = () => {

        if (whyInputs.length < 5) {
            const newInputs = [
                ...whyInputs,
                { label: `Why ${whyInputs.length + 1}`, value: ['', '', ''] },
            ];
            setWhyInputs(newInputs);
        }
    };
    const whyInputshandleRemoveRow = (index) => {
        const updatedInputs = [...whyInputs];
        updatedInputs.splice(index, 1);
        setWhyInputs(updatedInputs);
    };

    const whyInputshandleInputChange = (index, subIndex, value) => {
        const updatedInputs = [...whyInputs];
        updatedInputs[index].value[subIndex] = value;
        setWhyInputs(updatedInputs);
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        setRootSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const rootHandleFileChange = (e) => {
        setRootSelectedFiles([...e.target.files]);
    };
    const rootHandleRemoveFile = (index) => {
        setRootSelectedFiles(rootSelectedFiles.filter((_, i) => i !== index));
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    return (
        <div>
            <Accordion className='mb-2 accordian_arrow'>
                <AccordionSummary
                    style={{
                        // color: '#0c63e4',
                        backgroundColor: '#533529',
                        boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
                        padding: '0px 20px',
                    }}
                    expandIcon={<ExpandMoreIcon className='accordian_arrow' />}
                    aria-controls='panel2-content'
                    id='panel2-header'
                >
                    <Typography className='accord_typo'>
                        ROOT CAUSE ANALYSIS
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div>
                        <div className=' pb-3'>

                            <TableContainer className='border tbl_scrool'>
                                <Table >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>{' '}
                                            {/* Placeholder for vertical heading */}
                                            <TableCell>
                                                <div className='accordian_tbl_txt'>Why did this specific issue occur?</div>
                                                {/* <div className='trianglediv'>
                                                                        Why did this specific issue occur?
                                                                    </div> */}
                                            </TableCell>
                                            <TableCell>
                                                <div className='accordian_tbl_txt'>
                                                    Why did this problem go undetected
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='accordian_tbl_txt' >

                                                    Why was the problem not prevented?
                                                </div>
                                            </TableCell >
                                            <TableCell >
                                                {/* <div className='trianglediv'><em className='triangle'></em>Action</div> */}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody >
                                        <TableRow>
                                            <TableCell style={{ width: "150px" }}>
                                                <label className='accordian_tbl_txt'>
                                                    Problem description
                                                </label>
                                            </TableCell>
                                            <TableCell colSpan={4}>
                                                <textarea
                                                    className='form-control'
                                                    style={{ backgroundColor: '#f1f0ef' }}
                                                    fullWidth
                                                    value={problemDescription}
                                                    onChange={(e) =>
                                                        setProblemDescription(e.target.value)
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>

                                        {whyInputs.map((input, index) => (
                                            <TableRow key={index}>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    {/* <label className='rootcause_label'>{input.label}</label> */}
                                                    <label className='accordian_tbl_txt'>{`${numberToWords(
                                                        index + 1
                                                    )} why`}</label>
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[0]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                0,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[1]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                1,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[2]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                2,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {index !== 0 && (
                                                        <IconButton
                                                            onClick={() =>
                                                                whyInputshandleRemoveRow(index)
                                                            }
                                                        >
                                                            <CloseIcon style={{ color: 'red', fontSize: '18px', }} />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        onClick={whyInputshandleAddRow}
                                                        disabled={whyInputs.length >= 5}
                                                    >
                                                        <AddIcon
                                                            className='blue'
                                                            style={{
                                                                fontSize: '20px',
                                                                // fontWeight: '500',
                                                            }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </div>
                        <div className='row'>
                            <div className='col-md-6 pe-3'>
                                <Form.Group
                                    // className='mb-3'
                                    controlId='exampleForm.ControlTextarea1'
                                >

                                    <Form.Control
                                        className='input_border'
                                        as='textarea'
                                        rows={2}
                                        placeholder='Write your Summary'
                                        style={{ backgroundColor: "#f1f0ef" }}
                                    />
                                </Form.Group>
                            </div>
                            <div className='col-md-6 ps-0'>
                                <div className='col-md-12 file_upload'>
                                    {/* <label className="text_color" for="formFileMultiple" class="form-label" onChange={handleFileChange}> Browse</label> */}
                                    <input class="form-control" type="file" id="formFileMultiple" multiple onChange={rootHandleFileChange} />
                                </div>

                            </div>

                            {/* <div className='d-flex justify-content-end gap-3 '>
                        <Button className='add-Field-btn' >Submit</Button>
                        <Button
                            className='dynamic_btn'
                        >
                            Close
                        </Button>
                    </div> */}
                        </div>
                        <div className='row accordian_row'>


                            {/* <div className='col-md-2 col-sm-2 col-xs-2 accordian_btn' >
<Button className='accordian_submit_btn  ' style={{ float: "none" }}>Submit</Button>

</div>
<div className='col-md-2 col-sm-2 col-xs-2 accordian_btn'>
<Button className='accordian_cancel_btn'>Close</Button>
</div> */}
                            <div className='col-md-8 attached-files-info mt-3'>
                                <div className="row">
                                    <div className="col-xxl-6">
                                        <div className="attached-files">
                                            <ul>
                                                {rootSelectedFiles.length > 0 && (
                                                    rootSelectedFiles.map((file, index) => (
                                                        <li key={index} className='mt-2'>
                                                            <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="file-icon">
                                                                        <TextSnippetIcon style={{ color: "#533529" }} />
                                                                    </span>
                                                                    <p className="mb-0 ms-2">{file.name}</p>
                                                                </div>
                                                                <div className="file-actions d-flex align-items-center">
                                                                    <div className="file-download me-2">
                                                                        <a href="#">
                                                                            <ArrowDownwardIcon style={{ marginRight: "5px" }} />
                                                                        </a>
                                                                    </div>
                                                                    <IconButton>
                                                                        <VisibilityIcon />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='delete'
                                                                        onClick={() => rootHandleRemoveFile(index)}
                                                                    >
                                                                        <CloseIcon className='close_icon' />
                                                                    </IconButton>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4'>
                                <Button className='accordian_submit_btn  ' style={{ float: "none", marginRight: "15px" }}>Submit</Button>
                                <Button className='accordian_cancel_btn'>Close</Button>
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default RootCauseAnalysisAccordian







// import React, { useState } from 'react';
// import {
//     Accordion, AccordionSummary, AccordionDetails, Typography, Button,
//     Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//     IconButton, List, ListItem, ListItemText, ListItemSecondaryAction
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import CloseIcon from '@mui/icons-material/Close';
// import AddIcon from '@mui/icons-material/Add';
// import Form from 'react-bootstrap/Form';


// const VisuallyHiddenInput = styled('input')({
//     clip: 'rect(0 0 0 0)',
//     clipPath: 'inset(50%)',
//     height: 1,
//     overflow: 'hidden',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     whiteSpace: 'nowrap',
//     width: 1,
// });

// const RootCauseAnalysisAccordion = () => {
//     const [whyInputs, setWhyInputs] = useState([{ label: 'first why', value: ['', '', ''] }]);
//     const [problemDescription, setProblemDescription] = useState('');
//     const [rootSelectedFiles, setRootSelectedFiles] = useState([]);

//     function numberToWords(number) {
//         const units = [
//             '', 'first', 'second', 'third', 'fourth', 'fifth',
//             'sixth', 'seventh', 'eighth', 'ninth',
//         ];
//         const teens = [
//             'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth',
//             'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
//         ];
//         const tens = [
//             '', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth',
//             'sixtieth', 'seventieth', 'eightieth', 'ninetieth',
//         ];

//         if (number < 10) return units[number];
//         if (number < 20) return teens[number - 10];
//         if (number < 100) return `${tens[Math.floor(number / 10)]} ${units[number % 10]}`.trim();
//         return number.toString();
//     }

//     const whyInputshandleAddRow = () => {
//         if (whyInputs.length < 5) {
//             setWhyInputs([...whyInputs, { label: `Why ${whyInputs.length + 1}`, value: ['', '', ''] }]);
//         }
//     };

//     const whyInputshandleRemoveRow = (index) => {
//         const updatedInputs = [...whyInputs];
//         updatedInputs.splice(index, 1);
//         setWhyInputs(updatedInputs);
//     };

//     const whyInputshandleInputChange = (index, subIndex, value) => {
//         const updatedInputs = [...whyInputs];
//         updatedInputs[index].value[subIndex] = value;
//         setWhyInputs(updatedInputs);
//     };

//     const handleDrop = (event) => {
//         event.preventDefault();
//         const files = Array.from(event.dataTransfer.files);
//         setRootSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     const rootHandleFileChange = (e) => {
//         setRootSelectedFiles([...e.target.files]);
//     };

//     const rootHandleRemoveFile = (index) => {
//         setRootSelectedFiles(rootSelectedFiles.filter((_, i) => i !== index));
//     };

//     const handleDragOver = (event) => {
//         event.preventDefault();
//     };

//     return (
//         <div>
//             <Accordion className='mb-2'>
//                 <AccordionSummary
//                     style={{
//                         backgroundColor: '#b7885a',
//                         boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
//                         padding: '0px 20px',
//                     }}
//                     expandIcon={<ExpandMoreIcon />}
//                     aria-controls='panel2-content'
//                     id='panel2-header'
//                 >
//                     <Typography className='accord_typo'>
//                         ROOT CAUSE ANALYSIS
//                     </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                     <div>
//                         <div className='row d-flex justify-content-between'>
//                             <div>
//                                 <TableContainer className='border'>
//                                     <Table>
//                                         <TableHead>
//                                             <TableRow className='rootCause_tbl'>
//                                                 <TableCell></TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why did this specific issue occur?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why did this problem go undetected?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why was the problem not prevented?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                 </TableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             <TableRow>
//                                                 <TableCell className='rootCause_label_cell'>
//                                                     <label>Problem description</label>
//                                                 </TableCell>
//                                                 <TableCell colSpan={4}>
//                                                     <textarea
//                                                         className='form-control'
//                                                         style={{ backgroundColor: '#f1f0ef' }}
//                                                         fullWidth
//                                                         value={problemDescription}
//                                                         onChange={(e) => setProblemDescription(e.target.value)}
//                                                     />
//                                                 </TableCell>
//                                             </TableRow>

//                                             {whyInputs.map((input, index) => (
//                                                 <TableRow key={index}>
//                                                     <TableCell className='rootCause_label_cell'>
//                                                         <label className='rootcause_label'>{`${numberToWords(index + 1)} why`}</label>
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[0]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 0, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[1]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 1, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[2]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 2, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         {index !== 0 && (
//                                                             <IconButton onClick={() => whyInputshandleRemoveRow(index)}>
//                                                                 <CloseIcon style={{ color: 'red', fontSize: '18px' }} />
//                                                             </IconButton>
//                                                         )}
//                                                         <IconButton
//                                                             onClick={whyInputshandleAddRow}
//                                                             disabled={whyInputs.length >= 5}
//                                                         >
//                                                             <AddIcon className='blue' style={{ fontSize: '20px' }} />
//                                                         </IconButton>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                 </TableContainer>
//                             </div>
//                         </div>
//                         <div className='row mt-3'>
//                             <div className='col-md-6'>
//                                 <Form.Group controlId='exampleForm.ControlTextarea1'>
//                                     <Form.Control
//                                         className='input_border'
//                                         as='textarea'
//                                         rows={2}
//                                         placeholder='Write your Summary'
//                                     />
//                                 </Form.Group>
//                             </div>
//                             <div className='col-md-6'>
//                                 <div className='col-md-12 mt-3 file_upload'>
//                                     <input
//                                         className='form-control'
//                                         type='file'
//                                         id='formFileMultiple'
//                                         multiple
//                                         onChange={rootHandleFileChange}
//                                     />
//                                 </div>
//                                 {rootSelectedFiles.length > 0 && (
//                                     <List>
//                                         {rootSelectedFiles.map((file, index) => (
//                                             <ListItem key={index} divider>
//                                                 <ListItemText primary={file.name} />
//                                                 <ListItemSecondaryAction>
//                                                     <IconButton
//                                                         edge='end'
//                                                         aria-label='delete'
//                                                         onClick={() => rootHandleRemoveFile(index)}
//                                                     >
//                                                         <CloseIcon />
//                                                     </IconButton>
//                                                 </ListItemSecondaryAction>
//                                             </ListItem>
//                                         ))}
//                                     </List>
//                                 )}
//                             </div>
//                         </div>
//                         <div className='d-flex justify-content-end gap-3'>
//                             <Button className='add-Field-btn'>Submit</Button>
//                             <Button className='dynamic_btn'>Close</Button>
//                         </div>
//                     </div>
//                 </AccordionDetails>
//             </Accordion>
//         </div>
//     );
// };

// export default RootCauseAnalysisAccordion;
