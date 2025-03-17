declare module "*.png" {
    const value: string; 
    export default value;
}

declare module "*.jpg" {
    const value: string;
    export default value;
}

declare module "*.jpeg" {
    const value: string;
    export default value;
}

declare module "*.gif" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    import React from "react";
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export { ReactComponent }; // Named export for React component
    const srcUrl: string; // Avoiding 'src' name conflict
    export default srcUrl;
}
