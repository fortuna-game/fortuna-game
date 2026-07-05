import { supabase } from "./supabase";

export async function signUp(
  email: string,
  password: string,
  data: {
    first_name: string;
    last_name: string;
    username: string;
    phone: string;
  }
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data,
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
