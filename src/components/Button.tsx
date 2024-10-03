import React from "react";

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  variant: "text" | "fill"
}

// Button Component
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className,
  variant
}) => {
  const variantClassname = {
    'text': 'px-4 py-2 text-black',
    'fill': 'px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClassname[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
