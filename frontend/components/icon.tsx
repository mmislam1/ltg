import React from "react";
import { IconType } from "react-icons";

interface IconProps {
    icon: IconType;         
    size?: number;          
    className?: string;     
    color?: string;         
    onClick?: () => void;   
}

const Icon: React.FC<IconProps> = ({ icon, size = 20, className = "", color, onClick }) => {
    const IconComponent = icon as React.ElementType;
    return (
        <IconComponent
            size={size}
            className={`${className} cursor-pointer`}
            color={color}
            onClick={onClick}
        />
    );
};

export default Icon;
