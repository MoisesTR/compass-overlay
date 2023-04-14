import React, { useState, useRef, useEffect } from "react";

const Camera: React.FC = () => {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const handleCompass = (event: DeviceOrientationEvent) => {
      if (compassRef.current) {
        compassRef.current.style.transform = `rotate(${-event.alpha}deg)`;
      }
    };
    window.addEventListener("deviceorientation", handleCompass);
    return () => window.removeEventListener("deviceorientation", handleCompass);
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        setPhotoData(canvasRef.current.toDataURL("image/png"));
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <video ref={videoRef} autoPlay />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photoData && (
        <img src={photoData} alt="captured photo" style={{ maxWidth: "100%" }} />
      )}
      <button onClick={takePhoto}>Take Photo</button>
      <div
        ref={compassRef}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "50px",
          height: "50px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.5)",
        }}
      >
        <i className="fas fa-compass" style={{ fontSize: "24px" }} />
      </div>
    </div>
  );
};

export default Camera;
