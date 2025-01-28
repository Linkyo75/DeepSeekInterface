# DeepSeek Chat Interface

A web interface for interacting with DeepSeek models through Ollama.

## Prerequisites

1. **Install Ollama**
   - Visit [Ollama's website](https://ollama.ai)
   - Follow the installation instructions for your operating system

2. **Pull the DeepSeek Model - example below for the 7b parameters. Be mindful of the storage space (for instance, the model 7b will use 4.7GB of storage)**
   ```bash
   ollama pull deepseek-r1:7b
   ```

3. **Start Ollama**
   ```bash
   ollama serve
   ```

## Using the Interface

1. Make sure Ollama is running on your machine
2. Open the chat interface at [https://Linkyo75.github.io/DeepSeekInterface]()
3. Select your preferred model from the dropdown
4. Start chatting!

## Troubleshooting

If you're experiencing issues:

1. Ensure Ollama is running (`ollama serve`)
2. Check that you've pulled the DeepSeek model
3. Verify that port 11434 is accessible
4. Check your browser's console for any error messages

## Development

To run locally:
```bash
git clone https://github.com/Linkyo75/DeepSeekInterface.git
cd <repo-name>
npm install
npm run dev
```

## License

MIT