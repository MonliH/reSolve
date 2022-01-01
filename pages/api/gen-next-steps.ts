import type { NextApiRequest, NextApiResponse } from "next";

export type NextSteps = { nextSteps: string[] } | { error: string };

async function generateNextSteps(
  goal: string,
  temperature: number
): Promise<string[] | null> {
  const prompt = `Goal: Spend less money
Steps to take:
- Create a budget for the year
- Stop relying on credit cards
- Track all of your spending, including small purchases
- Plan your meals and shopping each week to avoid eating out
-----
Goal: Loose weight
Steps to take:
- Get a gym membership
- Hire a personal trainer to improve your form
- Choose a diet and stick to it
- Be consistent
-----
Goal: Play fewer video games
Steps to take:
- Spend more time outside with friends and family
- Limit your screen time
- Uninstall games you spend too much time on
-----
Goal: ${goal}
Steps to take:`;
  const generated = await fetch("https://api.eleuther.ai/completion", {
    method: "POST",
    body: JSON.stringify({
      context: prompt,
      top_p: 0.9,
      temp: temperature,
      response_length: 64,
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

  // Remove similar items from generated list
  const allItems = generatedItems.filter((item) => {
    const punctuationCount =
      item.match(/[.,\/#!\?$%\^&\*;:{}=\-_`~()]/g)?.length || 0;
    return punctuationCount < item.length / 5;
  });

  return allItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NextSteps>
) {
  const { goal, temperature }: { goal: string; temperature?: number } =
    JSON.parse(req.body);
  try {
    let nextSteps = await generateNextSteps(goal, temperature ?? 0.5);
    if (!nextSteps) {
      res.status(429).json({
        error: "Currently receiving too many requests. Please slow down.",
      });
    } else {
      res.status(200).json({ nextSteps });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to generate new suggestions." });
  }
}
