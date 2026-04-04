"""
Jarvis Council: A Multi-Agent Improvement Loop
Uses AutoGen to create a council of agents that research, code, and review
changes to the Jarvis Operating System.
"""
import asyncio
import os, warnings
warnings.filterwarnings("ignore")
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Use OpenRouter's free fallback model which supports the OpenAI schema
client = OpenAIChatCompletionClient(
    model="gpt-4o-mini",  # Use a generic ID that OpenRouter will map
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY", "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"),
    model_info={
        "json_output": False,
        "function_calling": True,
        "vision": False,
        "family": "gpt",
        "pricing": {"prompt": 0, "completion": 0},
        "structured_output": False
    }
)

researcher = AssistantAgent(
    name="Researcher",
    model_client=client,
    system_message="You are a Researcher. Find the best practices for improving the Jarvis OS."
)

coder = AssistantAgent(
    name="Coder",
    model_client=client,
    system_message="You are a Coder. Implement the improvements in Python or Bash."
)

reviewer = AssistantAgent(
    name="Reviewer",
    model_client=client,
    system_message="You are a Reviewer. Check for safety, efficiency, and clarity."
)

async def improve_jarvis():
    team = RoundRobinGroupChat([researcher, coder, reviewer], max_turns=5)
    print("🧠 Jarvis Council is now in session...")
    stream = team.run_stream(task="How can we make the 'jarvis-voice-loop.sh' more robust?")
    async for message in stream:
        print(f"[{message.source}]: {message.content}")

if __name__ == "__main__":
    asyncio.run(improve_jarvis())
