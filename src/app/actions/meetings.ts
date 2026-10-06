"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { analyzeTranscriptWithGemini } from "@/lib/gemini/meeting-analyzer";
import {
  checkUsageAllowance,
  incrementMonthlyUsage,
} from "@/lib/usage/usage-service";
import { logActivityEvent } from "@/lib/analytics/events";

export interface CreateMeetingState {
  error?: string;
  limitReached?: boolean;
  meetingId?: string;
}

/**
 * Server Action: Generates AI notes with Gemini and saves the meeting to Supabase
 * Strictly uses the authenticated user client under RLS policies.
 */
export async function createMeetingAction(
  _prevState: CreateMeetingState | null,
  formData: FormData
): Promise<CreateMeetingState> {
  const title = (formData.get("title") as string)?.trim();
  const transcript = (formData.get("transcript") as string)?.trim();
  const loomUrl = (formData.get("loomUrl") as string)?.trim() || null;

  // Validation
  if (!title) {
    return { error: "Meeting title is required." };
  }

  if (!transcript || transcript.length < 20) {
    return { error: "A transcript of at least 20 characters is required for AI analysis." };
  }

  if (loomUrl) {
    try {
      new URL(loomUrl);
    } catch {
      return { error: "The provided Loom URL is invalid. Please provide a valid URL or leave it blank." };
    }
  }

  // 1. Get authenticated user using SSR client (respecting RLS)
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase client is not available. Please verify your environment configuration." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to create meeting notes." };
  }

  // 2. CHECK USAGE LIMIT BEFORE CALLING GEMINI
  const { allowed, usage } = await checkUsageAllowance(supabase, user.id);
  if (!allowed) {
    return {
      error: `You've reached your ${usage.limit} free meetings this month. Upgrade to Pro for unlimited meeting notes.`,
      limitReached: true,
    };
  }

  // 3. Call Gemini server-side only
  let aiNotes;
  try {
    aiNotes = await analyzeTranscriptWithGemini(title, transcript);
  } catch (aiError: unknown) {
    const message =
      aiError instanceof Error
        ? aiError.message
        : "Failed to generate notes with Gemini AI.";
    return { error: `Gemini AI Error: ${message}` };
  }

  // 3. Insert record into `meetings` table using authenticated client
  const meetingPayload: {
    user_id: string;
    title: string;
    transcript: string;
    summary: string;
    loom_url?: string | null;
  } = {
    user_id: user.id,
    title,
    transcript,
    summary: aiNotes.summary,
    loom_url: loomUrl,
  };

  let { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .insert(meetingPayload)
    .select("id")
    .single();

  // Gracefully handle schema if loom_url column is not present in cache
  if (meetingError && meetingError.message.includes("loom_url")) {
    delete meetingPayload.loom_url;
    const fallbackInsert = await supabase
      .from("meetings")
      .insert(meetingPayload)
      .select("id")
      .single();
    meeting = fallbackInsert.data;
    meetingError = fallbackInsert.error;
  }

  if (meetingError || !meeting) {
    return { error: `Failed to save meeting to Supabase: ${meetingError?.message || "Unknown error"}` };
  }

  const meetingId = meeting.id;

  // 4. Insert action items if extracted
  if (aiNotes.action_items.length > 0) {
    const actionItemsPayload = aiNotes.action_items.map((item) => ({
      meeting_id: meetingId,
      task: item.task,
      assignee: item.assignee,
      due_date: item.due_date,
      completed: false,
    }));

    const { error: actionItemsError } = await supabase
      .from("action_items")
      .insert(actionItemsPayload);

    if (actionItemsError) {
      console.error("Warning: Failed to insert some action items:", actionItemsError.message);
    }
  }

  // 5. Insert key takeaways if extracted
  if (aiNotes.key_takeaways.length > 0) {
    const takeawaysPayload = aiNotes.key_takeaways.map((content) => ({
      meeting_id: meetingId,
      content,
    }));

    const { error: takeawaysError } = await supabase
      .from("key_takeaways")
      .insert(takeawaysPayload);

    if (takeawaysError) {
      console.error("Warning: Failed to insert some key takeaways:", takeawaysError.message);
    }
  }

  // 6. Insert key decisions if extracted
  if (aiNotes.key_decisions.length > 0) {
    const decisionsPayload = aiNotes.key_decisions.map((content) => ({
      meeting_id: meetingId,
      content,
    }));

    const { error: decisionsError } = await supabase
      .from("key_decisions")
      .insert(decisionsPayload);

    if (decisionsError) {
      console.error("Warning: Failed to insert some key decisions:", decisionsError.message);
    }
  }

  // 7. Insert follow-up questions if extracted
  if (aiNotes.follow_up_questions.length > 0) {
    const questionsPayload = aiNotes.follow_up_questions.map((content) => ({
      meeting_id: meetingId,
      content,
    }));

    const { error: questionsError } = await supabase
      .from("follow_up_questions")
      .insert(questionsPayload);

    if (questionsError) {
      console.error("Warning: Failed to insert some follow-up questions:", questionsError.message);
    }
  }

  // 8. Atomically increment monthly usage counter
  await incrementMonthlyUsage(supabase, user.id);

  // 9. Log activity event
  await logActivityEvent({
    userId: user.id,
    eventType: "meeting_created",
    metadata: {
      meetingId,
      title,
      hasLoomUrl: Boolean(loomUrl),
      actionItemsCount: aiNotes.action_items.length,
      takeawaysCount: aiNotes.key_takeaways.length,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/new");
  revalidatePath("/dashboard/meetings");
  redirect(`/dashboard/meetings/${meetingId}`);
}

/**
 * Server Action: Toggles action item completed state
 */
export async function toggleActionItemAction(
  actionItemId: string,
  completed: boolean,
  meetingId: string
) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Supabase client unavailable" };

  const { error } = await supabase
    .from("action_items")
    .update({ completed })
    .eq("id", actionItemId);

  if (error) {
    return { error: error.message };
  }

  if (completed) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await logActivityEvent({
        userId: user.id,
        eventType: "action_item_completed",
        metadata: { actionItemId, meetingId },
      });
    }
  }

  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}

/**
 * Server Action: Deletes a meeting and all associated records under RLS
 */
export async function deleteMeetingAction(meetingId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase client unavailable." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to delete a meeting." };
  }

  // Delete related items first to ensure clean removal regardless of FK constraints
  await supabase.from("action_items").delete().eq("meeting_id", meetingId);
  await supabase.from("key_takeaways").delete().eq("meeting_id", meetingId);
  await supabase.from("key_decisions").delete().eq("meeting_id", meetingId);
  await supabase.from("follow_up_questions").delete().eq("meeting_id", meetingId);

  const { error: deleteError } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  await logActivityEvent({
    userId: user.id,
    eventType: "meeting_deleted",
    metadata: { meetingId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard/action-items");
  redirect("/dashboard/meetings");
}

