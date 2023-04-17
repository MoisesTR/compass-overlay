import React, { useRef, useEffect, useState } from 'react';
import CompassImage from './assets/compass.svg'; // Adjust the path if necessary
import './App.css';

const CompassCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error starting camera:', error);
      }
    };
    startCamera();

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    } else {
      console.error('DeviceOrientationEvent is not supported on this device');
    }

    return () => {
      if ('DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  return (
    <div className="compass-camera">
      <video className="video-background" ref={videoRef} autoPlay playsInline />
      <div className="heading-display">
        <span>Heading: {Math.round(heading)}°</span>
      </div>
      <img
        src={CompassImage}
        alt="Compass"
        className="compass-image"
        style={{ transform: `rotate(${360 - heading}deg)` }}
      />
    </div>
  );
};

export default CompassCamera;
