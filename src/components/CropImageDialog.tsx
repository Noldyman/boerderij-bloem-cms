import { SyntheticEvent, useEffect, useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import { Button, Dialog, LinearProgress, Slider, Typography } from "@mui/material";
import "react-image-crop/src/ReactCrop.scss";

interface Props {
  imageToCrop?: File;
  onClose: () => void;
  onUpload: (blob: Blob) => void;
  loading: boolean;
  aspectRatio?: number;
}

export const CropImageDialog = ({
  imageToCrop,
  onClose,
  onUpload,
  loading,
  aspectRatio,
}: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState("");
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (imageToCrop) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
      reader.readAsDataURL(imageToCrop);
    }
  }, [imageToCrop]);

  useEffect(() => {
    const TO_RADIANS = Math.PI / 180;
    const createResultCanvas = async (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      crop: PixelCrop,
      scale: number,
      rotate: number
    ) => {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio;

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const rotateRads = rotate * TO_RADIANS;
      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.rotate(rotateRads);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      ctx.restore();
    };

    const resultCanvas = async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        resultCanvasRef.current
      ) {
        createResultCanvas(imgRef.current, resultCanvasRef.current, completedCrop, scale, rotate);
      }
    };
    setTimeout(() => {
      resultCanvas();
    }, 100);
  }, [completedCrop, scale, rotate]);

  const handleUpload = () => {
    if (!resultCanvasRef.current) {
      throw new Error("Crop canvas does not exist");
    }

    resultCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error("Failed to create blob");
      }
      onUpload(blob);
    });
  };

  function onImageLoad(e: SyntheticEvent<HTMLImageElement, Event>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 70,
        },
        20 / 15,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  const handleRotate = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") setRotate(newValue * 1.8);
  };

  const handleScale = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") setScale(1 + newValue * 0.01);
  };

  return (
    <Dialog open={Boolean(imageToCrop)} onClose={onClose} fullWidth>
      <div className="input-dialog">
        <Typography variant="h5">Foto bijsnijden</Typography>
        <ReactCrop
          crop={crop}
          aspect={aspectRatio}
          className="crop-component"
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          {imageToCrop && (
            <img
              className="image-to-crop"
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
              }}
              ref={imgRef}
              src={imgSrc}
              alt="Geen afbeelding"
              onLoad={onImageLoad}
            />
          )}
        </ReactCrop>
        <div className="crop-sliders">
          <div className="crop-slider">
            <Typography fontWeight="bold">Draaien</Typography>
            <Slider
              color="primary"
              value={rotate / 1.8}
              onChange={handleRotate}
              marks={[
                {
                  value: 0,
                  label: "0°",
                },
                {
                  value: 50,
                  label: "90°",
                },
                {
                  value: 100,
                  label: "180°",
                },
              ]}
            />
          </div>
          <div className="crop-slider">
            <Typography fontWeight="bold">Vergroten</Typography>
            <Slider
              color="primary"
              value={(scale - 1) * 100}
              onChange={handleScale}
              marks={[
                {
                  value: 0,
                  label: "1x",
                },
                {
                  value: 50,
                  label: "1.5x",
                },
                {
                  value: 100,
                  label: "2x",
                },
              ]}
            />
          </div>
        </div>
        <canvas className="result-canvas" ref={resultCanvasRef} />
        <div className="dialog-actions">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleUpload} variant="contained">
            Selectie uploaden
          </Button>
        </div>
        {loading ? <LinearProgress /> : <div className="loader-placeholder" />}
      </div>
    </Dialog>
  );
};
