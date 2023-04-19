import React, { useRef, useEffect, useState } from 'react';
import CompassImage from './assets/compass_4.svg';

const CompassCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);


  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };


  const getCardinalDirection = (angle: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
    return directions[index];
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current?.videoWidth || 0;
    canvas.height = videoRef.current?.videoHeight || 0;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw the video frame
      ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);


      // Draw the compass
      const compass = new Image();
      compass.src = CompassImage;
      const compassSize = Math.min(canvas.width, canvas.height) * 0.3;
      const compassX = (canvas.width - compassSize) / 2;
      const compassY = canvas.height - compassSize - 16;
      compass.onload = () => {
        // Rotate the compass based on the heading angle
        const orientation = window.screen.orientation?.angle || 0;
        const compassAngle = (heading - orientation + 360) % 360;
        const compassRadians = (compassAngle * Math.PI) / 180;
        ctx.translate(compassX + compassSize / 2, compassY + compassSize / 2);
        ctx.rotate(compassRadians);
        ctx.translate(-compassX - compassSize / 2, -compassY - compassSize / 2);
        ctx.drawImage(compass, compassX, compassY, compassSize, compassSize);

        // Draw the shape indicator
        const shapeSize = compassSize / 8;
        const shapeX = compassX + (compassSize - shapeSize) / 2;
        const shapeY = compassY + shapeSize;
        const shapeAngle = heading;
        const shapeRadians = (shapeAngle * Math.PI) / 180;
        ctx.translate(shapeX + shapeSize / 2, shapeY + shapeSize / 2);
        ctx.rotate(shapeRadians);
        ctx.translate(-shapeX - shapeSize / 2, -shapeY - shapeSize / 2);
        ctx.beginPath();
        ctx.moveTo(shapeX, shapeY);
        ctx.lineTo(shapeX + shapeSize, shapeY);
        ctx.lineTo(shapeX + shapeSize / 2, shapeY + shapeSize);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
      };
    }
  };



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
    getLocation();

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

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => Math.max(1, Math.min(prevZoom + delta, 5)));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <video
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom})`,
        }}
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
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
          Heading: {Math.round(heading)}° ({getCardinalDirection(heading)})
        </div>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
          Latitude: {latitude?.toFixed(6) || 'N/A'}, Longitude: {longitude?.toFixed(6) || 'N/A'}
        </div>
        <div style={{ width: '300px', height: '300px', position: 'relative' }}>
          <img
            src={CompassImage}
            alt="Compass"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: `translateX(-50%) rotate(${heading}deg)`,
              width: '150px',
              height: '150px',
              zIndex: 2,
            }}
          />

        </div>
      </div>
      <button
        onClick={captureImage}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 4,
          backgroundColor: '#444',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
        }}
      >
        📷
      </button>
      <button
        onClick={() => handleZoom(0.1)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 4,
          backgroundColor: '#444',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
        }}
      >
        +
      </button>
      <button
        onClick={() => handleZoom(-0.1)}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          zIndex: 4,
          backgroundColor: '#444',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
        }}
      >
        -
      </button>
    </div>
  );
};

export default CompassCamera;
