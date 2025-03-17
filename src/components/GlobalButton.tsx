import { FC } from "react";
import { twMerge } from "tailwind-merge";
import { LogIn, LucideIcon } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    ` relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px] 
        border-violet-300 px-4 py-2 font-semibold
        uppercase text-violet-300 transition-all duration-500
        
        before:absolute before:inset-0
        before:-z-10 before:translate-x-[150%]
        before:translate-y-[150%] before:scale-[2.5]
        before:rounded-[100%] before:bg-violet-300
        before:transition-transform before:duration-1000
        before:content-[""]

        hover:scale-105 hover:text-neutral-900
        hover:before:translate-x-[0%]
        hover:before:translate-y-[0%]
        active:scale-95`,
    {
        variants: {
            variant: {
                landing:
                "border-blue-300 text-blue-300 before:bg-blue-300 hover:text-neutral-900 bg-black",
                chat: "border-violet-300 text-violet-300 before:bg-violet-300 hover:text-white bg-slate-900",
            },
        },
        defaultVariants: {
            variant: "landing",
        },
    }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
    text?: string;
    icon?: LucideIcon;
    className?: string;
    onClick?: () => void;
}

const GlobalButton: FC<ButtonProps> = ({ text = "Sign up free", icon: Icon = LogIn, onClick, variant, className }) => {
    return (
        <button onClick={onClick} className={twMerge(buttonVariants({ variant }), className)}>
            <Icon className="size-5" />
            <span>{text}</span>
        </button>
    );
};

export default GlobalButton;
