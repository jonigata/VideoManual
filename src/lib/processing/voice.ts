import OpenAI from 'openai';

const apiKey = '';

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
