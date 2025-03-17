/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            animation: {
                "shiny-text": "shiny-text 8s infinite",
            },
            keyframes: {
                "shiny-text": {
                    "0%, 90%, 100%": {
                    backgroundPosition: "calc(-100% - var(--shiny-width)) 0",
                    },
                    "30%, 60%": {
                    backgroundPosition: "calc(100% + var(--shiny-width)) 0",
                    },
                },
            },
        },
    },
    plugins: [],
};
