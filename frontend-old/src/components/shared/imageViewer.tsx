import { CircularProgress } from '@mui/joy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { ImageViewerControls } from './imageViewerControls';

const scaleUp = true;
const zoomFactor = 8;

export const ImageViewer = ({ src }: { src: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(0);

  const imageScale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0 || imageNaturalWidth === 0 || imageNaturalHeight === 0) return 0;
    const scale = Math.min(containerWidth / imageNaturalWidth, containerHeight / imageNaturalHeight);
    return scaleUp ? scale : Math.max(scale, 1);
  }, [containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight]);

  const handleResize = useCallback(() => {
    if (container !== null) {
      const rect = container.getBoundingClientRect();
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);
    } else {
      setContainerWidth(0);
      setContainerHeight(0);
    }
  }, [container]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handleImageOnLoad = (image: HTMLImageElement) => {
    setIsLoading(false);
    setImageNaturalWidth(image.naturalWidth);
    setImageNaturalHeight(image.naturalHeight);
  };

  useEffect(() => {
    const image = new Image();
    image.onload = () => handleImageOnLoad(image);
    image.src = src;
  }, [src]);

  if (isLoading) return <CircularProgress />;

  return (
    <div
      style={{
        zIndex: 2,
        marginTop: '50px',
        height: 'calc(100vh - 100px)',
        width: '100vw',
        marginBottom: '50px'
      }}
      ref={(el: HTMLDivElement | null) => setContainer(el)}
    >
      {imageScale > 0 && (
        <TransformWrapper
          key={`${containerWidth}x${containerHeight}`}
          initialScale={imageScale}
          minScale={imageScale}
          maxScale={imageScale * zoomFactor}
          centerOnInit
        >
          <ImageViewerControls />
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%'
            }}
          >
            <img src={src} alt={'document'} />
          </TransformComponent>
        </TransformWrapper>
      )}
    </div>
  );
};
