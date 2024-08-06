import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { ingredients } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'user', content: `Generate a recipe using some of the following ingredients: ${ingredients}` },
        ],
      });

      res.status(200).json({ recipe: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}