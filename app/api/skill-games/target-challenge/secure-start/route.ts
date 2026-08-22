import { skillGamesLockedResponse } from "@/lib/skillGamesLock";

export async function POST() {
  return skillGamesLockedResponse();
}
