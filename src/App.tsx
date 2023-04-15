import React, { useState, useRef, useEffect } from "react";

const Camera: React.FC = () => {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

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
      setCompassHeading(event.alpha || 0);
    };
    window.addEventListener("deviceorientation", handleCompass);

    return () => {
      window.removeEventListener("deviceorientation", handleCompass);
    };
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

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.style.transform = `rotate(${compassHeading}deg)`;
    }
  }, [compassHeading]);

  return (
    <div style={{ position: "relative" }}>
      <video ref={videoRef} autoPlay />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photoData && (
        <img src={photoData} alt="captured photo" style={{ maxWidth: "100%" }} />
      )}
      <button onClick={takePhoto}>Take Photo</button>
      <div
        style={{
          position: "absolute",
          top: "120px",
          left: "120px",
          width: "250px",
          height: "250px",
          backgroundImage: "url(./compass3.png)",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>N</div>
        <div className="degree" style={{ fontSize: "12px", fontWeight: "bold" }}>{compassHeading}°</div>
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            width: "2px",
            height: "30px",
            backgroundColor: "red",
            transform: `rotate(${compassHeading}deg)`,
            transformOrigin: "top center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Camera;
