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
        model:"google/gemma-2-9b-it:free",
        messages: [
          { role: 'user', content: `Generate a recipe using some of the following ingredients: ${ingredients}` },
        ],
        max_tokens:3000,
      });
      console.log('API Response:', completion)
      res.status(200).json({ recipe: completion.choices[0].message.content });
    } catch (error) {
      
      console.error('Error fetching recipe:',error);
      console.log(error?.status, error?.message)
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}