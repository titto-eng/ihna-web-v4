"use client"

import * as React from "react"
import { cn } from "@/lib/cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  /** Index of the selected snap point, and how many snap points there are (0 until embla has measured). */
  selectedIndex: number
  snapCount: number
  /** `prefers-reduced-motion: reduce`: scrolls jump instead of animating. */
  reducedMotion: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener?.("change", onChange)
  return () => mq.removeEventListener?.("change", onChange)
}

/** True when the visitor asks for reduced motion (false on the server). */
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCED_MOTION).matches,
    () => false
  )
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [snapCount, setSnapCount] = React.useState(0)
  const reducedMotion = useReducedMotion()

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setSelectedIndex(api.selectedScrollSnap())
    setSnapCount(api.scrollSnapList().length)
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev(reducedMotion)
  }, [api, reducedMotion])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext(reducedMotion)
  }, [api, reducedMotion])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index, reducedMotion)
    },
    [api, reducedMotion]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
      api?.off("reInit", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        snapCount,
        reducedMotion,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

/** One button per snap point; the selected one is a wider pill. Renders nothing until there are two snap points. */
function CarouselDots({
  className,
  onDark,
  ...props
}: React.ComponentProps<"div"> & { onDark?: boolean }) {
  const { snapCount, selectedIndex, scrollTo } = useCarousel()
  if (snapCount < 2) return null
  return (
    <div data-slot="carousel-dots" className={cn("flex items-center", className)} {...props}>
      {Array.from({ length: snapCount }, (_, i) => (
        <button
          key={i}
          type="button"
          className="group grid size-6 cursor-pointer place-items-center rounded-full"
          aria-label={`Go to slide ${i + 1} of ${snapCount}`}
          aria-current={i === selectedIndex ? "true" : undefined}
          onClick={() => scrollTo(i)}
        >
          <span
            aria-hidden
            className={cn(
              "block h-2 rounded-full transition-all duration-300",
              i === selectedIndex
                ? cn("w-5", onDark ? "bg-secondary" : "bg-primary-strong")
                : cn("w-2", onDark ? "bg-ink-foreground/40 group-hover:bg-ink-foreground/70" : "bg-foreground/25 group-hover:bg-foreground/50")
            )}
          />
        </button>
      ))}
    </div>
  )
}

/** "02 / 07" in the mono label style, for carousels with many snap points. */
function CarouselCounter({ className, ...props }: React.ComponentProps<"p">) {
  const { snapCount, selectedIndex } = useCarousel()
  if (snapCount < 2) return null
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <p data-slot="carousel-counter" className={cn("label-mono tabular-nums", className)} {...props}>
      <span className="sr-only">Slide </span>
      {pad(selectedIndex + 1)}
      <span aria-hidden> / </span>
      <span className="sr-only"> of </span>
      {pad(snapCount)}
    </p>
  )
}

export {
  type CarouselApi,
  useCarousel,
  useReducedMotion,
  CarouselDots,
  CarouselCounter,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
