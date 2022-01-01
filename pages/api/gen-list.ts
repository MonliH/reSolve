import type { NextApiRequest, NextApiResponse } from "next";
import {
  makeCommaSeparatedString,
  ML_MODEL_URL,
  normalizeString,
} from "../../lib/utils";
import natural from "natural";

export type NewItems = { items: string[] } | { error: string };

function getRandom<T>(arr: T[], n: number): T[] {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

async function generateMore(
  items: string[],
  temperature: number
): Promise<string[] | null> {
  const similarString = makeCommaSeparatedString(
    getRandom(items, Math.min(items.length, 2)).map((item) => `"${item}"`)
  );
  const prompt = `Here are some New Year's Resolutions similar to "Improve my social anxiety":
- Improve my mental health
- Be a more positive person
- Go outside more
- Make more friends
-----
Here are some New Year's Resolutions similar to "Limit time I spend on screens" and "Stop playing video games":
- Spend less time on social media
- Get more exercise
- Read more books
- Get more sleep
-----
Here are some New Year's Resolutions similar to "Save more money":
- Ask for a raise
- Eat out less
- Find a purpose in life
-----
Here are some New Year's Resolutions similar to "Find a physical activity I enjoy" and "Eat healthier food":
- Sit less and move more
- Get more quality sleep
- Cook more meals at home
- Spend more time outdoors
-----
Here are some New Year's Resolutions similar to ${similarString}:`;
  const generated = await fetch(ML_MODEL_URL, {
    method: "POST",
    body: JSON.stringify({
      context: prompt,
      top_p: 0.9,
      temp: temperature,
      response_length: 32,
      remove_input: true,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!(generated.status >= 200 && generated.status < 300)) {
    return null;
  }

  const json = await generated.json();
  const generatedList = json[0].generated_text as string;
  if (generatedList.match(/-----/) === null) {
    return [];
  }
  const generatedItems = generatedList
    .split("-----")[0]
    .split("\n")
    .filter((s) => s || s === "-----")
    .map((s) => s.replace(/^-\s*/, "").replace(/^\s*/, ""))
    .slice(0, 6);

  let abort = false;

  // Remove similar items from generated list
  const allItems = await Promise.all(
    generatedItems.map(async (item, idx) => {
      const punctuationCount =
        item.match(/[.,\/#!\?$%\^&\*;:{}=\-_`~()]/g)?.length || 0;
      const normalized = await normalizeString(item);
      if (punctuationCount > item.length / 5) {
        abort = true;
      }
      return [normalized, idx, false] as [string, number, boolean];
    })
  );

  if (abort) {
    return [];
  }

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
    let newItems = await generateMore(items, temperature ?? 0.8);
    if (!newItems) {
      res.status(429).json({
        error: "Currently receiving too many requests. Please slow down.",
      });
    } else {
      res.status(200).json({ items: newItems });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to generate new suggestions." });
  }
}
