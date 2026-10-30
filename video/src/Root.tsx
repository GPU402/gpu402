import { Composition } from "remotion";
import { FILM_FRAMES, Film } from "./Film";
import { FILM2_FRAMES, Film2 } from "./film2/Film";
import { FPS, H, W } from "./theme";

export function Root() {
  return (
    <>
      <Composition id="GPU402Film" component={Film2} durationInFrames={FILM2_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="GPU402" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    </>
  );
}
