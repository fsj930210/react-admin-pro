import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@rap/components-ui/angle-slider";

export function AngleSliderDemo() {
  return (
    <AngleSlider defaultValue={[180]} max={360} min={0} step={1}>
      <AngleSliderTrack>
        <AngleSliderRange />
      </AngleSliderTrack>
      <AngleSliderThumb />
      <AngleSliderValue />
    </AngleSlider>
  );
}
