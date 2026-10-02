import { supabase } from './supabase';

// Veřejné RPC dotazníku spokojenosti. Autorizací je HMAC token z e-mailu —
// neplatný token vrací null/false, nikdy chybu (nic neprozrazuje).

export interface SurveyView {
  order_number: string | null;
  rating: number | null;
  answered: boolean;
  opted_out: boolean;
}

export interface SurveyAnswers {
  rating: number;
  source: string | null;
  sourceOther: string;
  comment: string;
}

export async function getSurveyForView(orderId: string, token: string): Promise<SurveyView | null> {
  const { data, error } = await supabase.rpc('get_survey_for_view', { p_id: orderId, p_token: token });
  if (error) throw error;
  return (data ?? null) as SurveyView | null;
}

export async function submitSurveyRating(orderId: string, token: string, rating: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('submit_survey_rating', {
    p_id: orderId,
    p_token: token,
    p_rating: rating,
  });
  if (error) throw error;
  return data === true;
}

export async function submitSurveyAnswers(
  orderId: string,
  token: string,
  answers: SurveyAnswers,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('submit_survey_answers', {
    p_id: orderId,
    p_token: token,
    p_rating: answers.rating,
    p_source: answers.source,
    p_source_other: answers.sourceOther,
    p_comment: answers.comment,
  });
  if (error) throw error;
  return data === true;
}

export async function surveyOptOut(orderId: string, token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('survey_opt_out', { p_id: orderId, p_token: token });
  if (error) throw error;
  return data === true;
}
