import { ComponentPropsWithRef, useEffect, useState } from "react";
import styled from "styled-components";
import MatIcon from "./MatIcon";

type ImageLoaderProps = {
  src?: string;
  border?: boolean;
  icon?: boolean;
  round?: boolean;
  fallbackIcon?: string;
} & ComponentPropsWithRef<"img">;

const Img = styled.img<{ round?: boolean; border?: boolean }>`
  border: ${({ border }) => (border ? "4px solid" : "none")};
  border-color: ${({ theme }) => theme.colors.semitransparent};
  border-radius: ${({ round }) => (round ? "50%" : "4px")};
  flex-shrink: 0;
`;

/** Default application image loader with some light animation */
const ImageLoader = styled((props: ImageLoaderProps) => {
  const {
    src,
    icon = false,
    border = false,
    className = "",
    round = false,
    fallbackIcon = "image",
    style,
    ...rest
  } = props;
  const cName = `scale-in ${className} ${round ? "round" : ""}`.trim();
  const [imgSrc, setSrc] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (src === imgSrc) return;

    setErr(false);
    setLoaded(false);
    setSrc("");

    if (!src) return;

    setLoading(true);
    const img = new Image();
    img.onerror = () => {
      setErr(true);
      setLoaded(true);
      setLoading(false);
    };
    img.onload = () => {
      setSrc(src);
      setLoaded(true);
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  if (loading) return <span className="spinner--before" />;
  if (!loaded) return <MatIcon style={style} icon={fallbackIcon} />;
  if (err) return <MatIcon style={style} icon="close" />;
  if (icon) return <MatIcon style={style} icon="check_circle" />;

  return (
    <Img
      border={border}
      round={round}
      className={cName}
      src={src}
      {...rest}
      alt={rest.alt}
    />
  );
})``;

export default ImageLoader;
