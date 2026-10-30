import { Composition } from "remotion";
import { FILM_FRAMES, Film } from "./Film";
import { FPS, H, W } from "./theme";

export function Root() {
  return <Composition id="GPU402" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />;
}
