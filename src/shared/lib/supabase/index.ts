import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wknnvptouhqyimzjaayw.supabase.co";
const supabaseKey = "sb_publishable_4dMl2vaVV4FvRYSiEnYbSw_yMXhMSu9";

export const supabase = createClient(supabaseUrl, supabaseKey);
