import type { NextApiRequest, NextApiResponse } from "next";
import { makeCommaSeparatedString, normalizeString } from "../../lib/utils";
import natural from "natural";

export type NewItems = { items: string[] } | { error: string };

async function generateMore(
  items: string[],
  temperature: number
): Promise<string[]> {
  const similarString = makeCommaSeparatedString(
    items.map((item) => `"${item}"`)
  );
  const prompt = `Here are some New Year's Resolutions similar to "Improve my social anxiety":
- Speak with a therapist about my social anxiety
- Challenge negative thoughts about myself
- Practice speaking with people more
- Be more kind to people
===
Here are some New Year's Resolutions similar to "Find a physical activity I enjoy", "Eat more whole grain foods", and "Get more quality sleep":
- Sit less and move more
- Cook more meals at home
- Spend more time outdoors
===
Here are some New Year's Resolutions similar to "Limit time I spend on screens" and "Live a more balanced life":
- Spend less time on social media
- Stop playing video games
- Read more books
===
Here are some New Year's Resolutions similar to "Save more money":
- Make a budget and stick to it
- Avoid using my credit card for purchases
- Track all my spending
- Find a higher paying job
- Eat out less
===
Here are some New Year's Resolutions similar to ${similarString}:
- `;
  const generated = await fetch("https://api.eleuther.ai/completion", {
    method: "POST",
    body: JSON.stringify({
      context: prompt,
      top_p: 0.9,
      temp: temperature,
      response_length: 128,
      remove_input: true,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await generated.json();
  const generatedList = json[0].generated_text as string;
  const generatedItems = generatedList
    .split("===")[0]
    .split("\n")
    .filter((s) => s || s === "===")
    .map((s) => s.replace(/^-\s*/, "").replace(/^\s*/, ""))
    .slice(0, 6);

  // Remove similar items from generated list
  const allItems = await Promise.all(
    generatedItems.map(async (item, idx) => {
      const punctuationCount =
        item.match(/[.,\/#!\?$%\^&\*;:{}=\-_`~()]/g)?.length || 0;
      const normalized = await normalizeString(item);
      return [normalized, idx, punctuationCount > item.length / 5] as [
        string,
        number,
        boolean
      ];
    })
  );

  console.log(allItems);

  await Promise.all(
    items.map(async (unnormalized) => {
      const item1 = await normalizeString(unnormalized);
      for (const item2 of allItems) {
        if (!item2[2]) {
          // Calculate similarity
          const similarity = natural.JaroWinklerDistance(item1, item2[0]);
          if (similarity > 0.8) {
            // Remove item2 if similar
            item2[2] = true;
          }
        }
      }
    })
  );

  for (const item1 of allItems) {
    for (const item2 of allItems) {
      if (item1[1] !== item2[1] && !item2[2]) {
        // Calculate similarity
        const similarity = natural.JaroWinklerDistance(item1[0], item2[0]);
        if (similarity > 0.8) {
          // Remove item2 if similar and item1 has not been removed
          item2[2] = true;
        }
      }
    }
  }

  const newItems = generatedItems.filter(
    (item, idx) => allItems[idx] && !allItems[idx][2] && item
  );

  return newItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewItems>
) {
  const { items, temperature }: { items: string[]; temperature?: number } =
    JSON.parse(req.body);
  try {
    let newItems = await generateMore(items, temperature ?? 0.5);
    res.status(200).json({ items: newItems });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate new suggestions." });
  }
}
