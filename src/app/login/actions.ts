"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData): Promise<string | null> {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Attempt to sign in the user
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return authError.message; // Return error message if authentication fails
  }

  // Extract user ID from authData
  const userId = authData?.user?.id;

  if (!userId) {
    return "Authentication failed, user ID not found";
  }

  // Convert userId to string explicitly if needed
  const userIdStr = userId.toString();

  // Check if the user exists in the 'operators' table
  const { data: operators, error: operatorsError } = await supabase
    .from("operators")
    .select("id")
    .eq("admin_email", email);

  if (operatorsError) {
    return "Error querying operators table."; // Return a generic error message
  }

  // Check if any operator's ID matches the authenticated user's ID
  const operatorExists = operators.some(
    (operator) => operator.id.toString() === userIdStr
  );

  if (!operatorExists) {
    return "The user is not an operator"; // Return message if user is not found in 'operators' table
  }

  return null; // No error
}
