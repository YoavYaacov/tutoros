import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  // כשל מוקדם וברור — עדיף מהתנהגות שקטה ולא צפויה בזמן ריצה
  throw new Error(
    "חסרים VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. העתק את .env.example ל-.env.local ומלא אותם.",
  );
}

// זהו המפתח הציבורי (publishable/anon) בלבד. Service Role Key אף פעם לא כאן.
export const supabase = createClient(url, publishableKey);
