import Image, { type ImageProps } from 'next/image'

// next/image for CMS media. With `trailingSlash: true` Next hands the optimiser `/api/media/file/x.jpg/`, which
// Payload answers with a 308, so the optimised image never loads. Local media is served as-is until next.config
// gets a loader (see report); remote URLs (S3 later) still go through the optimiser.
export default function MediaImage(props: ImageProps) {
  const local = typeof props.src === 'string' && props.src.startsWith('/api/media/')
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} unoptimized={local || props.unoptimized} />
}
