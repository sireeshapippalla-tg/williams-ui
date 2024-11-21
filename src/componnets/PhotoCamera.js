
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';

const PhotoCamera = () => {

    const cameraRef = useRef(null);
    const [image, setImage] = useState(null);

    const handleCapture = (e) => {
        e.preventDefault()
        const capturedImage = cameraRef.current.takePhoto();
        console.log("capturedImage", capturedImage)
        setImage(capturedImage); // Save the captured image
    };
    const handleDelete = () => {
        setImage(null); // Clear the captured image
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            {!image ? (
                <div>
                    {/* Camera view */}
                    <Camera ref={cameraRef} aspectRatio={16 / 9} facingMode="environment" />
                    <button onClick={handleCapture}>Capture Photo</button>
                </div>
            ) : (
                <div>
                    {/* Display captured image */}
                    <img src={image} alt="Captured" style={{ width: '100%' }} />
                    <button onClick={handleDelete}>Delete Photo</button>
                </div>
            )}
        </div>
    );
}

export default PhotoCamera


