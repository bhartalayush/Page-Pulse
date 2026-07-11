# Case Study: PromptDesk

## The Problem
Developing and iterating on LLM prompts is often a fragmented process. Developers write a prompt in their code, run it, test it, and tweak it iteratively. There is no unified workspace to track prompt versions, evaluate their safety and tone, or test them simultaneously against multiple active Large Language Models without writing complex boilerplate code or paying for multiple subscriptions.

## The Approach
PromptDesk was built to solve this fragmentation by providing a unified, distraction-free environment. Built as a Single Page Application using React and Vite, the architecture focuses on seamless client-side state management for folders, prompts, and version histories. 

To solve the multi-model testing problem, I integrated the OpenRouter API. This allows the application to query an extensive list of dynamically updating, free-tier AI models. Instead of hardcoding model endpoints which often become deprecated, the application queries the API in real-time, filters for active free endpoints, and allows the user to dynamically select their three preferred arena combatants via a custom Settings interface.

## The Result
The final product is a fully-functional, beautifully designed workspace. Users can draft complex prompts, save iterative versions, and trigger the Live Model Arena. In the arena, the application broadcasts the user's active prompt to three disparate LLMs concurrently and streams their responses back into a comparative dashboard. The UI is heavily polished, featuring dynamic routing, motion animations, and a cohesive design system that provides a premium user experience.

## What I Learned
Through building PromptDesk, I solidified my understanding of complex React state management, particularly when dealing with deeply nested objects (Workspaces -> Folders -> Prompts -> Versions). I also gained practical experience interacting with LLM aggregation APIs like OpenRouter, handling edge cases such as rate-limiting, dynamic endpoint retirement, and parsing dynamic JSON schemas. Finally, I learned the importance of immediate, visual user feedback when handling asynchronous tasks that may take several seconds to complete, implementing loading states and toast notifications to drastically improve UX.
