import { useEffect } from 'react';

import Box from '@mui/material/Box';

import { Lightbox, useLightbox } from 'src/components/lightbox';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

// ----------------------------------------------------------------------

export function ProductDetailsCarousel({ images }) {
  const carousel = useCarousel({ thumbs: { slidesToShow: 'auto' } });

  const slides = images?.map((img) => ({ src: img })) || [];

  const lightbox = useLightbox(slides);

  useEffect(() => {
    if (lightbox.open) {
      carousel.mainApi?.scrollTo(lightbox.selected, true);
    }
  }, [carousel.mainApi, lightbox.open, lightbox.selected]);

  return (
    <>
      <div>
        <Box sx={{ mb: 2.5, position: 'relative' }}>
          <CarouselArrowNumberButtons
            {...carousel.arrows}
            options={carousel.options}
            totalSlides={carousel.dots.dotCount}
            selectedIndex={carousel.dots.selectedIndex + 1}
            sx={{ right: 16, bottom: 16, position: 'absolute' }}
          />

          <Carousel carousel={carousel} sx={{ borderRadius: 2 }}>
            {slides.map((slide) => (
              <Box
                key={slide.src}
                onClick={() => lightbox.onOpen(slide.src)}
                sx={{
                  // Marco cuadrado con fondo blanco
                  bgcolor: '#fff',
                  borderRadius: 2,
                  cursor: 'zoom-in',
                  width: '100%',
                  aspectRatio: '1 / 1', // conserva 1:1 como antes
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  minWidth: 320,
                }}
              >
                <Box
                  component="img"
                  alt={slide.src}
                  src={slide.src}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain', // evita recorte, ajusta dentro
                    display: 'block',
                    backgroundColor: '#fff',
                  }}
                />
              </Box>
            ))}
          </Carousel>
        </Box>

        <CarouselThumbs
          ref={carousel.thumbs.thumbsRef}
          options={carousel.options?.thumbs}
          slotProps={{ disableMask: true }}
          sx={{
            width: 360,
            mx: 'auto', // centra el contenedor de thumbs respecto al ancho disponible
            display: 'flex',
            justifyContent: 'center',
            // Intenta que los thumbs también usen contain
            '& img': {
              objectFit: 'contain',
              backgroundColor: '#fff',
            },
          }}
        >
          {slides.map((item, index) => (
            <CarouselThumb
              key={item.src}
              index={index}
              src={item.src}
              selected={index === carousel.thumbs.selectedIndex}
              onClick={() => carousel.thumbs.onClickThumb(index)}
            />
          ))}
        </CarouselThumbs>
      </div>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </>
  );
}
