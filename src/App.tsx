import { useEffect, useRef } from 'react'
import './App.css'

const CameraOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const { alpha } = event;
      // alpha is the compass heading (in degrees)
      // beta is the device's tilt forward or backward (in degrees)
      // gamma is the device's tilt left or right (in degrees)
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Get the camera feed and draw it on the canvas
          const video = document.createElement('video');
          video.autoplay = true;
          video.width = canvas.width;
          video.height = canvas.height;
          navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            video.srcObject = stream;
          });
          const drawFrame = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          };
          requestAnimationFrame(drawFrame);

          // Draw the compass image on top of the camera feed
          const image = new Image();
          image.onload = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const size = Math.min(canvas.width, canvas.height) * 0.8;
            const imageX = centerX - size / 2;
            const imageY = centerY - size / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((-alpha! * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
            ctx.drawImage(image, imageX, imageY, size, size);
          };
          image.src = './compass.png';
        }
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default CameraOverlay;