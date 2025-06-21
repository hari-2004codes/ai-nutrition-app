// test/testParse.js
import fs from 'fs';
import path from 'path';
import { parseSegmentationResult } from '../backend/controllers/mealController.js';

// Load sample JSON from a file, or embed directly
const sample = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sampleSegmentation.json'), 'utf-8'));

const parsed = parseSegmentationResult(sample);
console.log('Parsed items:', JSON.stringify(parsed, null, 2));
