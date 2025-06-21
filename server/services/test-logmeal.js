import dotenv from 'dotenv';
dotenv.config();

import { recognizeDishFromFile, getNutrition } from './logmeal.js';

async function test() {
    console.log('LogMeal API Key:', process.env.LOGMEAL_API_KEY);    
        
    const rec = await recognizeDishFromFile('./services/download.jpeg'); // path to the image
    console.log('Recognition result:', rec);

    const { dishes } = rec;
    const top = dishes[0];
    console.log('Top dish:', top);

    const nutri = await getNutrition(top.dishId, 150); // quantity of the dish
    console.log('Nutrition for 150g:', nutri);
}

test().catch(console.error);
