import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Heebo", "system-ui", "sans-serif"],
      },
      colors: {
        // צבעי TutorOS — נגזרים מטוקן העיצוב במסמך האב, לא ברירת מחדל גנרית
        ink: {
          50: "#F4F6F8",
          100: "#E6EAEF",
          400: "#5B6B82",
          700: "#26344A",
          900: "#16233D", // צבע טקסט/ניווט ראשי — כחול-לילה
        },
        brand: {
          50: "#EAF5F2",
          100: "#CFE9E1",
          400: "#3FA491",
          600: "#2F8F7A", // ירוק-טיל — כפתורי פעולה עיקריים ("התחל שיעור")
          700: "#22705F",
        },
        amber: {
          50: "#FBF3E6",
          400: "#D98F3B", // אזהרות תשלום / הדגשות פיננסיות בלבד
          600: "#B96F22",
        },
        surface: "#F5F7FA",
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
