export default {
    content: [
        "./index.html",
        './src/**/*.{js,ts,jsx,tsx}',
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    ],
    theme: {
        extend: {
            colors: {
            },
            fontFamily: {
                sans: ['Graphik', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
