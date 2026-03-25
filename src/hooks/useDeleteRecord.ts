import { useState } from "react";
import { supabase } from "../supabase";

export function useDeleteRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteRecord(id: string, onSuccess: () => void) {
    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("practice_records")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      onSuccess();
    }

    setLoading(false);
  }

  return { deleteRecord, loading, error };
}
