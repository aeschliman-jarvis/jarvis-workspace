# Chrome Automation Skill (CDP)

**Trigger:** When the user asks for browser control, form filling, or "seeing" their screen.

**Protocol:**
1.  **Launch:** Open Chrome with `--remote-debugging-port=9222` and a dedicated `--user-data-dir`.
2.  **Connect:** Use the `web_fetch` or specialized CDP tools to interact with the page at `http://localhost:9222`.
3.  **Execute:** Perform clicks, form filling, and navigation as requested.
4.  **Close:** Terminate the debug instance when the task is complete to free up resources.

**Note:** This requires the user to close existing Chrome instances before launching the debug version.
