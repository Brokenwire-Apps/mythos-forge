import { useState } from "react";
import { noOp } from "utils";
import { Input, Label } from "./Form";
import ImageLoader from "components/Common/ImageLoader";
import { Selectable } from "components/Common/Containers";

type ImageUploaderProps = {
  src?: string;
  type?: string;
  width?: number;
  height?: number;
  onImageFile?: (file?: File) => void;
  onImageUrl?: (url: string) => void;
};

const ImageUploader = (props: ImageUploaderProps) => {
  const { src, onImageFile = noOp, type = "Cover" } = props;
  const [imgSrc, setSrc] = useState(src);
  const updateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = e.target.files || [];
    if (!file) return onImageFile();

    const img = new Image();
    img.onload = () => {
      setSrc(img.src);
      onImageFile(file);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <Label direction="column">
      <span className="label">
        {type} <span className="accent--text">Image</span>
      </span>

      <Selectable>
        <ImageLoader
          border
          width={"100%"}
          src={imgSrc}
          alt={type}
          style={{ fontSize: "8rem" }}
        />
      </Selectable>

      <Input
        type="file"
        hidden
        accept="image/*"
        onChange={updateImage}
        style={{ padding: "0 0.5rem" }}
      />
    </Label>
  );
};

export default ImageUploader;
