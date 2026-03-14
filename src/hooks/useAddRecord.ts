import { useState } from "react";
import { supabase } from "../supabase";
import type { Stroke } from "../types";

export type AddRecordForm = {
  date: string;
  distance: string;
  time: string;
  stroke: Stroke;
  facility: string;
  memo: string;
};

const initialForm: AddRecordForm = {
  date: "",
  distance: "",
  time: "",
  stroke: "クロール",
  facility: "",
  memo: "",
};

export function useAddRecord() {
  const [form, setForm] = useState<AddRecordForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(onSuccess: () => void) {
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("practice_records").insert({
      date: form.date,
      distance: Number(form.distance),
      time: form.time,
      stroke: form.stroke,
      facility: form.facility,
      memo: form.memo || null,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setForm(initialForm);
      onSuccess();
    }

    setLoading(false);
  }

  return { form, loading, error, handleChange, handleSubmit };
}
