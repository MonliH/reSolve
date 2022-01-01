import { NewItems } from "../pages/api/gen-list";

export async function generateMore(
  original: string[],
  temperature?: number
): Promise<NewItems> {
  const request = await fetch("/api/gen-list", {
    method: "POST",
    body: JSON.stringify({ items: original, temperature }),
  });

  return await request.json();
}
