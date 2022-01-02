import type { NextApiRequest, NextApiResponse } from "next";
import { API_KEY, DAVINCI_URL, ML_MODEL_URL, rateLimit } from "../../lib/utils";

export type NextSteps = { nextSteps: string[] } | { error: string };

async function generateNextSteps(
  goal: string,
  temperature: number
): Promise<string[] | null> {
  const prompt = `Goal: Spend less money
Specific steps to take:
- Create a budget for the year
- Stop relying on credit cards
- Track all of your spending, including small purchases
- Plan your meals and shopping each week to avoid eating out
-----
Goal: Lose weight
Specific steps to take:
- Hire a personal trainer to improve your form
- Choose a diet and stick to it for the rest of the year
- Run a 10 kilometer race
- Be consistent
-----
Goal: Play fewer video games
Specific steps to take:
- Spend at least an hour outside with friends and family
- Limit your screen time to 30 minutes
- Uninstall the games you spend too much time on
-----
Goal: ${goal}
Specific steps to take:`;
  const generated = await fetch(DAVINCI_URL, {
    method: "POST",
    body: JSON.stringify({
      prompt,
      temperature,
      top_p: 1,
      max_tokens: 48,
      stop: ["-----"],
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!(generated.status >= 200 && generated.status < 300)) {
    return null;
  }

  const json = await generated.json();
  const generatedList = json.choices[0].text as string;
  const generatedItems = generatedList
    .split("\n")
    .filter((s) => s)
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

const limiter = rateLimit({
  interval: 70 * 1000,
  uniqueTokenPerInterval: 10,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NextSteps>
) {
  const { goal, temperature }: { goal: string; temperature?: number } =
    JSON.parse(req.body);
  const token = req.headers.authorization?.split(" ")[1] || "DEFAULT_TOKEN";
  try {
    let nextSteps;
    try {
      await limiter.check(res, 11, token);
      nextSteps = await generateNextSteps(goal, temperature ?? 0.5);
    } catch (e) {
      res.status(429).json({
        error: "Too many requests. Please try again in a few moments.",
      });
      return;
    }
    if (!nextSteps) {
      res.status(500).json({
        error: "Failed to generate new suggestions.",
      });
    } else {
      res.status(200).json({ nextSteps });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to generate new suggestions." });
  }
}
