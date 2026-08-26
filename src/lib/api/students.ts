import { supabase } from "@/lib/supabase";
import type { Student, StudentInput } from "@/types/database";

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("first_name", { ascending: true });
  if (error) throw error;
  return data as Student[];
}

export async function listStudentsByFamily(familyId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("family_id", familyId)
    .order("first_name", { ascending: true });
  if (error) throw error;
  return data as Student[];
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Student;
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const { data, error } = await supabase.from("students").insert(input).select().single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, input: Partial<StudentInput>): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}
