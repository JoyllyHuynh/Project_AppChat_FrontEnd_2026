import { useEffect, useState } from "react";

const STORAGE_KEY = "webchat_theme";

const readTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
};

export default function useTheme() {
    const [theme, setTheme] = useState(readTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    return { theme, toggleTheme };
}