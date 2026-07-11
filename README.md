# PromptDesk

PromptDesk is a powerful workspace for prompt engineering and iterative AI evaluation. It provides a distraction-free environment for developers and prompt engineers to draft, version, and evaluate prompts against multiple AI models simultaneously.

## Features

- **Workspace & Folder Management:** Organize your prompts into structured folders and workspaces.
- **Version Control:** Automatically track versions of your prompts as you iterate.
- **Live Model Arena:** Test your prompts side-by-side against three active OpenRouter AI models simultaneously.
- **Dynamic Model Selection:** Choose exactly which three AI models you want to pit against each other from a live, real-time list of available endpoints.
- **Evaluation Engine:** Score your prompts on key metrics such as accuracy, safety, and tone.
- **Modern UI:** Built with a beautiful, responsive, and distraction-free dark mode interface.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhartalayush/PromptDesk.git
   cd PromptDesk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Configuration

To use the Live Model Arena, you need a free OpenRouter API key.
1. Sign up at [OpenRouter.ai](https://openrouter.ai).
2. Generate an API Key.
3. Open the Settings panel in PromptDesk and paste your key. Your key is stored securely in your browser's local storage and is never sent to our servers.

## Deployment

This project can be easily deployed to Vercel or Netlify. A `vercel.json` file is included to handle client-side routing.

## Acknowledgements

This project was built as the Final Submission for the Digital Heroes Full Stack Developer Trial. 

## License

This project is licensed under the MIT License - see the LICENSE file for details.
