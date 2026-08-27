import { supabase } from "@/lib/supabase";
import type { Lesson, LessonInput, LessonStatus } from "@/types/database";

export async function listLessonsInRange(startIso: string, endIso: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .gte("scheduled_start", startIso)
    .lt("scheduled_start", endIso)
    .order("scheduled_start", { ascending: true });
  if (error) throw error;
  return data as Lesson[];
}

export async function listUpcomingLessons(limit = 10): Promise<Lesson[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .gte("scheduled_start", nowIso)
    .eq("status", "scheduled")
    .order("scheduled_start", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as Lesson[];
}

export async function getLesson(id: string): Promise<Lesson> {
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Lesson;
}

export async function listLessonsByStudent(studentId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("student_id", studentId)
    .order("scheduled_start", { ascending: false });
  if (error) throw error;
  return data as Lesson[];
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  const { data, error } = await supabase.from("lessons").insert(input).select().single();
  if (error) throw error;
  return data as Lesson;
}

export async function updateLesson(id: string, input: Partial<LessonInput>): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Lesson;
}

export async function updateLessonStatus(id: string, status: LessonStatus): Promise<Lesson> {
  return updateLesson(id, { status });
}

/** מסמן "התחלת שיעור" — אידמפוטנטי: אם actual_start כבר קיים, לא נוגעים בו (לא "מאפסים" זמן שכבר נמדד) */
export async function startLesson(id: string): Promise<Lesson> {
  const lesson = await getLesson(id);
  if (lesson.actual_start) return lesson;
  return updateLesson(id, { actual_start: new Date().toISOString() });
}
