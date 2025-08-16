export interface AIProvider {
  generateText(prompt: string): Promise<string>;
}

export class OpenAIProvider implements AIProvider {
  private client;
  constructor(apiKey: string) {
    this.client = new (require("openai").OpenAI)({ apiKey });
  }
  async generateText(prompt: string) {
    const res = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content;
  }
}

// To switch to Claude, you'd just add another provider class and swap imports
/* 
export class ClaudeProvider implements AIProvider {
  private client;
  constructor(apiKey: string) {
    this.client = new (require("openai").OpenAI)({ apiKey });
  }
  async generateText(prompt: string) {
    const res = await this.client.chat.completions.create({
      model: "claude-3-5-sonnet-20240620",
      messages: [{ role: "user", content: prompt }],
    });
  }
} 
*/
