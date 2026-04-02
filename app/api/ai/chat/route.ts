import { streamText, convertToModelMessages, tool } from 'ai'
import { z } from 'zod'

const tools = {
  analyzeCode: tool({
    description: 'Analyze code for potential issues, bugs, or improvements',
    inputSchema: z.object({
      code: z.string().describe('The code to analyze'),
      language: z.string().describe('Programming language'),
      focusArea: z.enum(['bugs', 'performance', 'security', 'style', 'all']).describe('What to focus on'),
    }),
    execute: async ({ code, language, focusArea }) => {
      // In a real app, this could call a more sophisticated analysis service
      return {
        analyzed: true,
        language,
        focusArea,
        lineCount: code.split('\n').length,
        suggestions: `Analysis complete for ${focusArea}. Review the code for best practices.`,
      }
    },
  }),
  
  generateCode: tool({
    description: 'Generate code based on a description',
    inputSchema: z.object({
      description: z.string().describe('What the code should do'),
      language: z.string().describe('Target programming language'),
      framework: z.string().nullable().describe('Framework if applicable'),
    }),
    execute: async ({ description, language, framework }) => {
      return {
        generated: true,
        language,
        framework,
        description,
        note: 'Code generation complete. The assistant will provide the code.',
      }
    },
  }),
  
  explainCode: tool({
    description: 'Explain what a piece of code does',
    inputSchema: z.object({
      code: z.string().describe('The code to explain'),
      language: z.string().describe('Programming language'),
      detailLevel: z.enum(['brief', 'detailed', 'beginner']).describe('Level of detail'),
    }),
    execute: async ({ code, language, detailLevel }) => {
      return {
        explained: true,
        language,
        detailLevel,
        lineCount: code.split('\n').length,
      }
    },
  }),
  
  refactorCode: tool({
    description: 'Suggest refactoring improvements for code',
    inputSchema: z.object({
      code: z.string().describe('The code to refactor'),
      language: z.string().describe('Programming language'),
      goal: z.enum(['readability', 'performance', 'modularity', 'testing']).describe('Refactoring goal'),
    }),
    execute: async ({ code, language, goal }) => {
      return {
        refactored: true,
        language,
        goal,
        originalLines: code.split('\n').length,
      }
    },
  }),
}

export async function POST(req: Request) {
  try {
    const { messages, projectId, currentFile } = await req.json()

    // Build system prompt with context
    let systemPrompt = `You are CodeForge AI, an expert coding assistant integrated into a code editor IDE.
You have access to tools for analyzing, generating, explaining, and refactoring code.

Guidelines:
- Provide clear, concise explanations
- Use code blocks with proper language tags (e.g., \`\`\`typescript, \`\`\`python)
- Suggest best practices and optimizations
- Be helpful with debugging and error fixing
- Keep responses focused and actionable
- When generating code, make it production-ready
- Use tools when appropriate to enhance your analysis

You can:
1. Analyze code for bugs, performance issues, security vulnerabilities
2. Generate new code based on descriptions
3. Explain complex code in simple terms
4. Suggest refactoring improvements`

    if (currentFile) {
      systemPrompt += `

Current file context:
- File: ${currentFile.name}
- Language: ${currentFile.language}
- Content preview:
\`\`\`${currentFile.language}
${currentFile.content?.slice(0, 1000)}${currentFile.content?.length > 1000 ? '\n// ... (truncated)' : ''}
\`\`\``
    }

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      maxOutputTokens: 4096,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI Chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }), 
      { status: 500 }
    )
  }
}
