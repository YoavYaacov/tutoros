import { supabase } from "@/lib/supabase";
import type { Family, FamilyInput } from "@/types/database";

export async function listFamilies(): Promise<Family[]> {
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .order("family_name", { ascending: true });
  if (error) throw error;
  return data as Family[];
}

export async function getFamily(id: string): Promise<Family> {
  const { data, error } = await supabase.from("families").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Family;
}

export async function createFamily(input: FamilyInput): Promise<Family> {
  const { data, error } = await supabase.from("families").insert(input).select().single();
  if (error) throw error;
  return data as Family;
}

export async function updateFamily(id: string, input: Partial<FamilyInput>): Promise<Family> {
  const { data, error } = await supabase
    .from("families")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Family;
}
