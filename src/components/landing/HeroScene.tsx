import { JSX, useEffect, useState } from "react";
import { Particles } from "../ui/particles";
import { HeroRevealComponent } from "./HeroReveal";

export function HeroSceneComponent(): JSX.Element {
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    setColor("#000000");
  }, []);

  return (
    <div className="relative flex pt-4 md:pt-10 w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
      <HeroRevealComponent />
      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        ease={80}
        color={color}
        refresh
      />
    </div>
  );
}
