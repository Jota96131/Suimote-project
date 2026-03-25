import { useState } from "react";
import { supabase } from "../supabase";
import type { Stroke, PracticeRecord } from "../types";

export type EditRecordForm = {
  date: string;
  distance: string;
  time: string;
  stroke: Stroke;
  facility: string;
  memo: string;
};

export function recordToForm(record: PracticeRecord): EditRecordForm {
  return {
    date: record.date,
    distance: String(record.distance),
    time: record.time ?? "",
    stroke: record.stroke,
    facility: record.facility ?? "",
    memo: record.memo ?? "",
  };
}

export function useEditRecord(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateRecord(form: EditRecordForm, onSuccess: () => void) {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("practice_records")
      .update({
        date: form.date,
        distance: Number(form.distance),
        time: form.time || null,
        stroke: form.stroke,
        facility: form.facility || null,
        memo: form.memo || null,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      onSuccess();
    }

    setLoading(false);
  }

  return { loading, error, updateRecord };
}
