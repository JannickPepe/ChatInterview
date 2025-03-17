

import { cn } from "../../lib/utils";
import { AnimatedShinyText } from "../ui/animated-shiny-text";
import { ArrowRight } from 'lucide-react';


export function TitleBadgeComponent() {
    return (
        <div className="z-10 flex pt-4 items-center justify-center">
            <div className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-slate-800 dark:hover:bg-neutral-800",
                )}
            >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                    <span>🚀Introducing ChatSpace</span>
                    <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" /> 
                </AnimatedShinyText>
            </div>
        </div>
    );
}
