import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaOptionsType } from 'embla-carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PropType = {
  options?: EmblaOptionsType;
  slides: React.ReactNode[];
};

export const Carousel = (props: PropType) => {
  const { options, slides } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    // Set initial state
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());

    // Listen for events
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="relative min-w-0 flex-grow-0 flex-shrink-0 basis-full" key={index}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-4 -translate-y-1/2">
        <button
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className="h-12 w-12 rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-0"
        >
          <ChevronLeft className="mx-auto h-6 w-6" />
        </button>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <button
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className="h-12 w-12 rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-0"
        >
          <ChevronRight className="mx-auto h-6 w-6" />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === selectedIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
