import { NewItems } from "../pages/api/gen-list";
import { NextSteps } from "../pages/api/gen-next-steps";

export async function generateMore(
  original: string[],
  temperature?: number
): Promise<NewItems> {
  const request = await fetch("/api/gen-list", {
    method: "POST",
    body: JSON.stringify({
      items: original,
      temperature,
    }),
  });

  return await request.json();
}

export async function generateNextSteps(
  goal: string,
  temperature?: number
): Promise<[NextSteps, number]> {
  const request = await fetch("/api/gen-next-steps", {
    method: "POST",
    body: JSON.stringify({
      goal,
      temperature,
    }),
  });

  return [await request.json(), request.status];
}
