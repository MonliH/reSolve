import natural from "natural";
import WordPOS from "wordpos";

WordPOS.defaults = {
  includeData: true,
};

export function makeCommaSeparatedString(
  arr: string[],
  useOxfordComma: boolean = true
): string {
  const listStart = arr.slice(0, -1).join(", ");
  const listEnd = arr.slice(-1);
  const conjunction =
    arr.length <= 1
      ? ""
      : useOxfordComma && arr.length > 2
      ? ", and "
      : " and ";

  return [listStart, listEnd].join(conjunction);
}

// prettier-ignore
export const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
  "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself",
  "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these",
  "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do",
  "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
  "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after",
  "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
  "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
  "t", "can", "will", "just", "don", "should", "now",
]);

const tokenizer = new natural.TreebankWordTokenizer();
const wordpos = new WordPOS();

export function normalizeString(s: string): Promise<string> {
  return new Promise((resolve) => {
    wordpos.getVerbs(s, (vs: string[]) => {
      const verbs = new Set(vs.map((v) => v.toLowerCase()));
      resolve(
        tokenizer
          .tokenize(s)
          .map((w) => w.toLowerCase())
          .filter((w) => !STOP_WORDS.has(w) && !verbs.has(w))
          .map((token) => natural.PorterStemmer.stem(token))
          .filter((token) => token)
          .join(" ")
      );
    });
  });
}
