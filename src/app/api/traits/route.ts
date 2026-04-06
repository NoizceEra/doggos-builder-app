import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const CATEGORIES = ["Background", "Skin", "Clothes", "Face", "Hats"];

export async function GET() {
  const traitsDir = path.join(process.cwd(), 'public', 'traits');
  const allTraits: any[] = [];

  try {
    for (const category of CATEGORIES) {
      const categoryPath = path.join(traitsDir, category);
      
      // Ensure directory exists
      try {
        await fs.access(categoryPath);
      } catch {
        continue; 
      }

      const files = await fs.readdir(categoryPath);
      
      for (const file of files) {
        if (file.toLowerCase().endsWith('.png')) {
          allTraits.push({
            Category: category,
            Name: path.parse(file).name,
            FileName: file
          });
        }
      }
    }

    // Write back to src/traits.json
    const traitsJsonPath = path.join(process.cwd(), 'src', 'traits.json');
    await fs.writeFile(traitsJsonPath, JSON.stringify(allTraits, null, 2));

    return NextResponse.json({ success: true, count: allTraits.length, traits: allTraits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { traits } = await req.json();
    const traitsJsonPath = path.join(process.cwd(), 'src', 'traits.json');
    await fs.writeFile(traitsJsonPath, JSON.stringify(traits, null, 2));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
