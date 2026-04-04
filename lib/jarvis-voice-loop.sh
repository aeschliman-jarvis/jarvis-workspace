#!/bin/bash
# jarvis-voice-loop.sh
# Listens for voice input, processes it with Whisper, and speaks the response.

echo "🎙️ Jarvis Voice Loop Active. Say 'exit' to quit."

while true; do
    echo "👂 Listening..."
    # Record 5 seconds of audio from default mic
    ffmpeg -f avfoundation -i ":0" -y -t 5 ~/.openclaw/workspace/temp_input.wav 2>/dev/null

    # Transcribe using local Whisper
    TEXT=$(whisper ~/.openclaw/workspace/temp_input.wav --model tiny.en --language en --output_format txt 2>/dev/null | tail -n 1)
    
    if [ -z "$TEXT" ] || [ "$TEXT" = "exit" ]; then
        echo "🛑 Loop ended."
        break
    fi

    echo "👤 You: $TEXT"

    # Get response from OpenClaw
    RESPONSE=$(openclaw send "Voice input: $TEXT" --timeout 30 2>/dev/null)

    if [ -n "$RESPONSE" ]; then
        echo "🤖 Jarvis: $RESPONSE"
        # Speak using Samantha voice
        say -v "Samantha" "$RESPONSE"
    fi
done
