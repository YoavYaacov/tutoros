import { supabase } from "@/lib/supabase";
import type { LessonBoard } from "@/types/database";

export async function getLessonBoardByLessonId(lessonId: string): Promise<LessonBoard | null> {
  const { data, error } = await supabase
    .from("lesson_boards")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data as LessonBoard | null;
}

/** יוצר לוח לשיעור, ומעדכן גם את lessons.board_id (מצביע כפול קיים בסכימה) בהתאם */
export async function createLessonBoard(
  lessonId: string,
  studentId: string,
  boardData: Record<string, unknown> = {},
): Promise<LessonBoard> {
  const { data: board, error: boardError } = await supabase
    .from("lesson_boards")
    .insert({ lesson_id: lessonId, student_id: studentId, board_data: boardData })
    .select()
    .single();
  if (boardError) throw boardError;

  const { error: lessonError } = await supabase
    .from("lessons")
    .update({ board_id: board.id })
    .eq("id", lessonId);
  if (lessonError) throw lessonError;

  return board as LessonBoard;
}

export async function updateLessonBoardData(
  id: string,
  boardData: Record<string, unknown>,
): Promise<LessonBoard> {
  const { data, error } = await supabase
    .from("lesson_boards")
    .update({ board_data: boardData })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as LessonBoard;
}

/** ה-board_data של השיעור הקודם (החדש ביותר) של אותו תלמיד שיש לו לוח, לצורך "המשך מהשיעור הקודם" */
export async function getPreviousBoardDataForStudent(
  studentId: string,
  excludeLessonId: string,
): Promise<Record<string, unknown> | null> {
  const { data: prevLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, board_id")
    .eq("student_id", studentId)
    .neq("id", excludeLessonId)
    .not("board_id", "is", null)
    .order("scheduled_start", { ascending: false })
    .limit(1);
  if (lessonsError) throw lessonsError;
  if (!prevLessons || prevLessons.length === 0) return null;

  const { data: board, error: boardError } = await supabase
    .from("lesson_boards")
    .select("board_data")
    .eq("id", prevLessons[0].board_id)
    .maybeSingle();
  if (boardError) throw boardError;
  return (board?.board_data as Record<string, unknown>) ?? null;
}
