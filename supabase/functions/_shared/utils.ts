
export async function genHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Update with a valid OpenAI API key
// Currently using a placeholder - you'll need to replace this with a real key
export const OPENAI_API_KEY = "REPLACE_WITH_VALID_OPENAI_API_KEY";
