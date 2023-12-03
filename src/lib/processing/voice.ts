import OpenAI from 'openai';

const apiKey = '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';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

export async function createVoice(input: string): Promise<Blob> {
  const response = await openai.audio.speech.create({
    "model": "tts-1",
    "input": input,
    "voice": "shimmer"
  });
  return await response.blob();
}
