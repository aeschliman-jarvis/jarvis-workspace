import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

const WORKSPACE = path.join(process.env.HOME || '/Users/jaeschliman', '.openclaw', 'workspace');

export async function POST(request: Request) {
  try {
    const { goal, agentType } = await request.json();
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const agent = agentType || 'generalist';
    
    // Execute the mission runner
    const command = `node lib/mission-runner.js "${goal}" --agent ${agent}`;
    const output = execSync(command, { 
      cwd: WORKSPACE,
      encoding: 'utf8',
      timeout: 30000 // 30s timeout for initialization
    });

    // Parse the output to find the new mission ID
    const idMatch = output.match(/Mission: (mission-[a-z0-9-]+)/);
    const missionId = idMatch ? idMatch[1] : 'unknown';

    return NextResponse.json({ 
      success: true, 
      missionId,
      message: `Mission started with ${agent} agent.`
    });

  } catch (error: any) {
    console.error('Mission start failed:', error);
    return NextResponse.json({ 
      error: 'Failed to start mission', 
      details: error.message 
    }, { status: 500 });
  }
}
