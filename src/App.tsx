import React, { useRef, useEffect, useState } from 'react';
import CompassImage from './assets/compass.svg'; // Adjust the path if necessary
import ArrowImage from './assets/arrow.svg'; // Adjust the path if necessary

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
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <video
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        ref={videoRef}
        autoPlay
        playsInline
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>Heading: {Math.round(heading)}°</div>
        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
          <img
            src={CompassImage}
            alt="Compass"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
          />
          <img
            src={ArrowImage}
            alt="Arrow"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${heading}deg)`,
              width: '60%',
              height: '60%',
              zIndex: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompassCamera;
