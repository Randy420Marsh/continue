import { streamSse } from "@continuedev/fetch";
import { ChatCompletionCreateParams } from "openai/resources/index";
import { CompletionOptions, LLMOptions } from "../../index.js";
import { BaseLLM } from "../index.js";
import { LlmApiRequestType } from "../openaiTypeConverters.js";
import { ReasoningEffort, effortToBudgetTokens } from "../reasoning.js";

class LlamaCpp extends BaseLLM {
  static providerName = "llama.cpp";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "http://127.0.0.1:8080/",
  };

  // Use OpenAI-compatible /v1/chat/completions for chat requests
  protected useOpenAIAdapterFor: (LlmApiRequestType | "*")[] = ["streamChat"];

  // llama-server returns reasoning_content in responses (deepseek format)
  protected supportsReasoningContentField = true;

  protected modifyChatBody(
    body: ChatCompletionCreateParams,
    options?: CompletionOptions,
  ): ChatCompletionCreateParams {
    if (options?.reasoning && options?.reasoningEffort) {
      const raw = effortToBudgetTokens(
        options.reasoningEffort as ReasoningEffort,
      );
      // Cap at 65% of context to guarantee room for prompt + output tokens.
      // Tests showed budget >= n_ctx causes the model to exhaust the context
      // mid-reasoning and produce empty content (config 3, effort_high_8192).
      const cap = Math.floor(this.contextLength * 0.65);
      const budget = raw === -1 ? cap : Math.min(raw, cap);
      if (budget > 0) {
        (body as any).thinking_budget_tokens = budget;
      }
      // budget_0 is intentionally skipped: without a server-side
      // --reasoning-budget-message it causes all output to land in
      // reasoning_content with no actual content (config 2 test result).
    }
    return body;
  }

  private _convertArgs(options: CompletionOptions, prompt: string) {
    return {
      n_predict: options.maxTokens,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      min_p: options.minP,
      mirostat: options.mirostat,
      stop: options.stop,
      top_k: options.topK,
      top_p: options.topP,
      temperature: options.temperature,
    };
  }

  protected async *_streamComplete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...this.requestOptions?.headers,
    };

    const resp = await this.fetch(new URL("completion", this.apiBase), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
        ...this._convertArgs(options, prompt),
      }),
      signal,
    });

    for await (const value of streamSse(resp)) {
      if (value.content) {
        yield value.content;
      }
    }
  }
}

export default LlamaCpp;
