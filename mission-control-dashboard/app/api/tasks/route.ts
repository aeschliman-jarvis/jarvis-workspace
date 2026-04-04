import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WORKSPACE = path.join(process.env.HOME || '/Users/jaeschliman', '.openclaw', 'workspace');

export async function GET() {
  const tasksPath = path.join(WORKSPACE, 'TASKS.md');
  let content = '';
  try {
    content = fs.readFileSync(tasksPath, 'utf8');
  } catch (e) {
    return NextResponse.json({ tasks: [] });
  }

  const tasks = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    if (line.startsWith('- [ ]')) {
      const title = line.replace('- [ ]', '').trim();
      let status: any = 'inbox';
      if (title.toLowerCase().includes('follow up')) status = 'waiting';
      else if (title.toLowerCase().includes('decide')) status = 'next';
      
      tasks.push({
        id: Math.random().toString(36).substr(2, 9),
        title,
        status,
      });
    }
  });

  return NextResponse.json({ tasks });
}
