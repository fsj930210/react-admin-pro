import { Cropper, CropperArea, CropperImage } from "@rap/components-ui/cropper";
import { Masonry, MasonryItem } from "@rap/components-ui/masonry";
import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@rap/components-ui/media-player";
import { Watermark } from "@rap/components-ui/watermark";

const masonryItems = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  height: 72 + (index % 4) * 28,
}));

export function LayoutMediaDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Cropper className="h-56 overflow-hidden rounded-md bg-muted">
        <CropperImage src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=640&auto=format&fit=crop" />
        <CropperArea withGrid />
      </Cropper>

      <Masonry className="h-72">
        {masonryItems.map((item) => (
          <MasonryItem
            key={item.id}
            className="rounded-md bg-muted p-3 text-sm"
            style={{ height: item.height }}
          >
            Review tile {item.id + 1}
          </MasonryItem>
        ))}
      </Masonry>

      <MediaPlayer className="overflow-hidden rounded-md border">
        <MediaPlayerVideo src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
        <MediaPlayerControls>
          <MediaPlayerPlay />
          <MediaPlayerSeek />
          <MediaPlayerTime />
          <MediaPlayerVolume />
        </MediaPlayerControls>
      </MediaPlayer>

      <Watermark
        content={["React Admin Pro", "Internal Preview"]}
        className="h-44 rounded-md border bg-muted/40 p-4"
        guard={false}
      >
        <div className="flex h-full items-center justify-center rounded-md bg-background/80 text-sm">
          Watermarked report preview
        </div>
      </Watermark>
    </div>
  );
}
