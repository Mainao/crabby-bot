import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"fixed flex items-center justify-center bg-transparent border-0 cursor-pointer p-0 z-150 transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-default",
	{
		variants: {
			size: {
				default: "w-[100px] h-[100px]",
				sm: "w-[70px] h-[70px]",
				lg: "w-[130px] h-[130px]",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	children?: ReactNode;
	position?: { bottom: number; right: number };
}

const Button = ({
	className,
	size,
	children,
	position,
	style,
	...props
}: ButtonProps) => {
	return (
		<button
			className={cn(buttonVariants({ size }), className)}
			style={{
				bottom: position?.bottom,
				right: position?.right,
				...style,
			}}
			{...props}
		>
			{children}
		</button>
	);
};

export { Button };
