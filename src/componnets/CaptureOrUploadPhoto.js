import React, { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import {
    Button,
    IconButton,
    Typography,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const CaptureOrUploadPhoto = ({ onFileChange }) => {
    const cameraRef = useRef(null);
    const [images, setImages] = useState([]); // Holds the captured or uploaded image
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);

    // Handle capturing photo
    const handleCapture = () => {
        const capturedImage = cameraRef.current.takePhoto();
        const newImages = [...images, capturedImage]
        setImages(newImages);
        onFileChange(newImages.concat(uploadedFiles));
        setCameraOpen(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = [...uploadedFiles, ...files];
        setUploadedFiles(newFiles);
        onFileChange(images.concat(newFiles));
    };

    const handleDeleteFile = (index, isImage) => {
        if (isImage) {
            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
            onFileChange(newImages.concat(uploadedFiles));
        } else {
            const newFiles = uploadedFiles.filter((_, i) => i !== index);
            setUploadedFiles(newFiles);
            onFileChange(images.concat(newFiles));
        }
    };


    return (

        // <Box >
        //     {/* Upload Actions */}
        //     <Box display="flex" gap={2} >
        //         {/* Camera Button */}
        //         <Button
        //             // variant="contained"
        //             className='accordian_cancel_btn'
        //             style={{backgroundColor:"white"}}
        //             color="primary"
        //             onClick={() => setCameraOpen(true)}
        //             startIcon={<CameraAltIcon />}
        //             sx={{
        //                 padding: "10px 20px",
        //                 textTransform: "none",
        //                 fontSize: "16px",
        //             }}
        //         >
        //             Take Photo
        //         </Button>

        //         {/* File Upload Button */}
        //         <Button
        //            className='accordian_cancel_btn'
        //            style={{backgroundColor:"white"}}
        //             component="label"
        //             startIcon={<CloudUploadIcon />}
        //             sx={{
        //                 // padding: "10px 20px",
        //                 textTransform: "none",
        //                 fontSize: "16px",
        //                 borderColor: "#3f51b5",
        //             }}
        //         >
        //             Upload Files
        //             <input
        //                 type="file"
        //                 multiple
        //                 accept="image/*"
        //                 style={{ display: "none" }}
        //                 onChange={handleFileSelect}
        //             />
        //         </Button>
        //     </Box>

        //     {/* Captured Photos Section */}
        //     {images.length > 0 && (
        //         <Box mb={3}>
        //             <Typography variant="h6" gutterBottom>
        //                 Captured Photos
        //             </Typography>
        //             <Grid container spacing={2}>
        //                 {images.map((image, index) => (
        //                     <Grid item xs={12} sm={6} md={4} key={index}>
        //                         <Box
        //                             sx={{
        //                                 position: "relative",
        //                                 borderRadius: "8px",
        //                                 overflow: "hidden",
        //                                 boxShadow: 2,
        //                             }}
        //                         >
        //                             <img
        //                                 src={image}
        //                                 alt={`Captured ${index}`}
        //                                 style={{ width: "100%", height: "200px", objectFit: "cover" }}
        //                             />
        //                             <Button
        //                                 variant="contained"
        //                                 color="error"
        //                                 size="small"
        //                                 onClick={() => handleDeleteFile(index, true)}
        //                                 sx={{
        //                                     position: "absolute",
        //                                     bottom: "10px",
        //                                     left: "50%",
        //                                     transform: "translateX(-50%)",
        //                                     padding: "5px 15px",
        //                                 }}
        //                             >
        //                                 Delete Photo
        //                             </Button>
        //                         </Box>
        //                     </Grid>
        //                 ))}
        //             </Grid>
        //         </Box>
        //     )}

        //     {/* Uploaded Files Section */}
        //     {uploadedFiles.length > 0 && (
        //         <Box>
        //             <h5 gutterBottom  style={{fontWeight:"600", marginTop:"10px"}}>
        //                 {`Uploaded Files (${uploadedFiles.length})`}
        //             </h5>
        //             <Grid container spacing={2}>
        //                 {uploadedFiles.map((file, index) => (
        //                     <Grid item xs={12} sm={6} md={6} key={index}>
        //                         <Box
        //                             sx={{
        //                                 display: "flex",
        //                                 alignItems: "center",
        //                                 justifyContent: "space-between",
        //                                 padding: 1.5,
        //                                 border: "1px solid #ddd",
        //                                 borderRadius: 2,
        //                                 backgroundColor: "#fff",
        //                                 boxShadow: 1,
        //                             }}
        //                         >
        //                             <Box display="flex" alignItems="center">
        //                                 <TextSnippetIcon
        //                                     sx={{
        //                                         color: "#3f51b5",
        //                                         marginRight: "8px",
        //                                     }}
        //                                 />
        //                                 <Typography
        //                                     variant="body2"
        //                                     sx={{
        //                                         maxWidth: "calc(100% - 50px)",
        //                                         overflow: "hidden",
        //                                         textOverflow: "ellipsis",
        //                                         whiteSpace: "nowrap",
        //                                     }}
        //                                 >
        //                                     {file.name}
        //                                 </Typography>
        //                             </Box>
        //                             <Box>
        //                                 <IconButton>
        //                                     <VisibilityIcon />
        //                                 </IconButton>
        //                                 <IconButton
        //                                     edge="end"
        //                                     onClick={() => handleDeleteFile(index, false)}
        //                                 >
        //                                     <CloseIcon />
        //                                 </IconButton>
        //                             </Box>
        //                         </Box>
        //                     </Grid>
        //                 ))}
        //             </Grid>
        //         </Box>
        //     )}

        //     {/* Camera Dialog */}
        //     <Dialog
        //         open={cameraOpen}
        //         onClose={() => setCameraOpen(false)}
        //         fullWidth
        //         maxWidth="sm"
        //     >
        //         <DialogTitle>
        //             Take Photo
        //             <IconButton
        //                 aria-label="close"
        //                 onClick={() => setCameraOpen(false)}
        //                 sx={{ position: "absolute", right: 8, top: 8 }}
        //             >
        //                 <CloseIcon />
        //             </IconButton>
        //         </DialogTitle>
        //         <DialogContent>
        //             <Camera ref={cameraRef} aspectRatio={16 / 9} facingMode="environment" />
        //         </DialogContent>
        //         <DialogActions>
        //             <Button
        //                 onClick={handleCapture}
        //                 variant="contained"
        //                 color="primary"
        //                 sx={{
        //                     textTransform: "none",
        //                     padding: "8px 20px",
        //                 }}
        //             >
        //                 Capture
        //             </Button>
        //         </DialogActions>
        //     </Dialog>
        // </Box>

        <Box>
            {/* Initial Action Section */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                    border: "1px dashed #ddd",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    textAlign: "center",
                    cursor: "pointer",
                }}
                onClick={() => setActionDialogOpen(true)}
            >
                <CloudUploadIcon sx={{ fontSize: "48px", color: "#533529" }} />
                <Typography variant="h6" color="textSecondary" mt={2}>
                    Click to Upload or Capture Photos
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Drag and drop files here or use the buttons to proceed
                </Typography>
            </Box>

            {/* Uploaded Files Section */}
            {uploadedFiles.length > 0 && (
                <Box
                    sx={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "#f9f9f9",
                        boxShadow: 1,
                        maxHeight: "200px",
                        overflowY: "auto", 
                        marginTop:"10px"
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            marginBottom: "8px",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#333",
                        }}
                    >
                        Uploaded Files ({uploadedFiles.length})
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        {uploadedFiles.map((file, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#fff",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    boxShadow: 1,
                                    border: "1px solid #ddd",
                                }}
                            >
                                <TextSnippetIcon
                                    sx={{
                                        fontSize: "18px",
                                        color: "#3f51b5",
                                        marginRight: "8px",
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: "120px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontSize: "14px",
                                    }}
                                >
                                    {file.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    sx={{ marginLeft: "8px", color: "red" }}
                                    onClick={() => handleDeleteFile(index, false)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}


            {/* Captured Photos Section */}
            {images.length > 0 && (
                <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                        Captured Photos
                    </Typography>
                    <Grid container spacing={2}>
                        {images.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        boxShadow: 2,
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`Captured ${index}`}
                                        style={{
                                            width: "100%",
                                            height: "150px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <Button
                                        // variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteFile(index, true)}
                                        sx={{
                                            position: "absolute",
                                            // bottom: "10px",
                                            // left: "50%",
                                            // transform: "translateX(-50%)",
                                            // padding: "5px 15px",
                                            top: "10px",  // Position from the top edge
                                            right: "10px", // Position from the right edge
                                            minWidth: "unset", // Prevent large button size
                                            padding: 0,
                                        }}
                                    >
                                        {/* Delete Photo */}
                                        <HighlightOffIcon />
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Action Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={() => setActionDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Upload or Capture Photos
                    <IconButton
                        aria-label="close"
                        onClick={() => setActionDialogOpen(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" gap={2} flexDirection="column" alignItems="center">
                        {/* Camera Button */}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CameraAltIcon />}
                            onClick={() => {
                                setCameraOpen(true);
                                setActionDialogOpen(false);
                            }}
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                padding: "10px 20px",
                                fontSize: "16px",
                            }}
                        >
                            Take Photo
                        </Button>
                        {/* File Upload Button */}
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                padding: "10px 20px",
                                fontSize: "16px",
                            }}
                        >
                            Upload Files
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    handleFileSelect(e);
                                    setActionDialogOpen(false);
                                }}
                            />
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Camera Dialog */}
            <Dialog
                open={cameraOpen}
                onClose={() => setCameraOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Take Photo
                    <IconButton
                        aria-label="close"
                        onClick={() => setCameraOpen(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Camera ref={cameraRef} aspectRatio={16 / 9} facingMode="environment" />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCapture}
                        variant="contained"
                        color="primary"
                        sx={{
                            textTransform: "none",
                            padding: "8px 20px",
                        }}
                    >
                        Capture
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CaptureOrUploadPhoto