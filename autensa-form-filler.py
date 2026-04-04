"""
Jarvis Autensa Form Filler
Uses browser-use to pilot Chrome and fill the Autensa form.
"""
import asyncio
from browser_use import Agent, Browser, ChatBrowserUse

async def fill_autensa_form():
    browser = Browser(
        headless=False,
        chrome_instance_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )
    
    agent = Agent(
        task="Go to localhost:4000, fill the Autensa form with standard test data, and submit it.",
        llm=ChatBrowserUse(),
        browser=browser,
    )
    
    try:
        await agent.run()
        print("✅ Form filled successfully.")
    except Exception as e:
        print(f"❌ Form fill failed: {e}")
    finally:
        await browser.close()

if __name__ == "__main__":
    asyncio.run(fill_autensa_form())
