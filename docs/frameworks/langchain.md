---
title: LangChain Integration
description: Wrap BlockRun in a custom LangChain LLM class that handles x402 payments automatically — chains, agents, and RAG over 70 models.
---

# LangChain Integration

Use BlockRun as an LLM provider in LangChain — either through the OpenAI-compatible [LiteLLM adapter](https://github.com/BlockRunAI/blockrun-litellm) (full chat model: tools, streaming, async) or a custom LLM class over the Python SDK. Both handle x402 payments automatically across chains, agents, and RAG.

[LangChain](https://github.com/langchain-ai/langchain) is the most popular framework for building LLM applications. BlockRun's `/v1/chat/completions` is already OpenAI-compatible at the protocol level; the only thing that differs is authentication — a per-request wallet signature instead of a Bearer key — and the two paths below bridge exactly that gap.

:::note{title="Community integration"}
No official `langchain-blockrun` package yet; use the two paths below or the BlockRun [SDK](../sdks/python.md) directly. BlockRun's primary paths are [Franklin](../products/franklin.md), the [MCP](../mcp/blockrun-mcp.md), and the SDKs.
:::

## Path 1 — `ChatOpenAI` via the BlockRun LiteLLM sidecar (recommended)

[`blockrun-litellm`](https://pypi.org/project/blockrun-litellm/) (v0.9.1) ships a local OpenAI-compatible proxy that signs x402 payments with your wallet. Any LangChain chat model that speaks the OpenAI protocol — `ChatOpenAI` — then works unchanged, including tool calling, streaming and async, which the string-in/string-out custom class in Path 2 cannot offer.

::::steps

:::step{title="Install"}
```bash
pip install 'blockrun-litellm[proxy]' langchain langchain-openai
```
:::

:::step{title="Start the sidecar"}
```bash
export BLOCKRUN_WALLET_KEY=0x...        # Base wallet; never leaves your machine
blockrun-litellm-proxy --port 4001      # → http://127.0.0.1:4001/v1
```

Add `--api-url https://sol.blockrun.ai/api` with a `SOLANA_WALLET_KEY` to pay on Solana. Keep the bind on loopback unless you also set `BLOCKRUN_PROXY_TOKEN`.
:::

:::step{title="Point ChatOpenAI at it"}
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="openai/gpt-5.4",                 # any BlockRun chat model id
    base_url="http://127.0.0.1:4001/v1",
    api_key="dummy",                        # ignored unless BLOCKRUN_PROXY_TOKEN is set
)

print(llm.invoke("Explain x402 in one sentence").content)
```
:::

::::

Prefer to stay in-process? `pip install blockrun-litellm langchain-litellm`, call `from blockrun_litellm import register; register()` once, and use `ChatLiteLLM(model="blockrun/openai/gpt-5.4")`.

## Path 2 — Custom LLM class over the Python SDK

No sidecar, no LiteLLM: a minimal `LLM` subclass over `blockrun_llm.LLMClient`. Text in, text out — fine for chains and RAG, not for tool-calling agents.

::::steps

:::step{title="Install LangChain and the BlockRun SDK"}
```bash
pip install langchain langchain-core blockrun-llm
```
:::

:::step{title="Define a custom LLM provider"}
```python
from typing import Any, List, Optional
from langchain_core.language_models.llms import LLM
from blockrun_llm import LLMClient

class BlockRunLLM(LLM):
    """BlockRun LLM provider for LangChain."""

    model: str = "openai/gpt-5.4"
    client: Any = None

    def __init__(self, model: str = "openai/gpt-5.4", **kwargs):
        super().__init__(**kwargs)
        self.model = model
        self.client = LLMClient()   # BLOCKRUN_WALLET_KEY or ~/.blockrun/.session

    @property
    def _llm_type(self) -> str:
        return "blockrun"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> str:
        return self.client.chat(self.model, prompt, stop=stop)

# Usage
llm = BlockRunLLM(model="openai/gpt-5.4")
```

`langchain_core.language_models.llms.LLM` is the import that works on both LangChain 0.3 and 1.x; the old `langchain.llms.base` path was removed in 1.0.
:::

::::

## Usage Examples

### Basic Chain (LCEL)

Works with either path — swap `llm` for the `ChatOpenAI` instance above if you are using the sidecar.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = BlockRunLLM(model="anthropic/claude-sonnet-4.6")

prompt = ChatPromptTemplate.from_template("Write a brief explanation of {topic}")
chain = prompt | llm | StrOutputParser()

result = chain.invoke({"topic": "x402 micropayments"})
print(result)
```

### Agent with Tools

Tool calling needs a chat model, so this uses Path 1. `create_agent` is LangChain 1.x; the sidecar forwards `tools` / `tool_choice` verbatim to the gateway.

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun

llm = ChatOpenAI(model="openai/gpt-5.4", base_url="http://127.0.0.1:4001/v1", api_key="dummy")

agent = create_agent(
    model=llm,
    tools=[DuckDuckGoSearchRun()],
    system_prompt="You are a helpful assistant.",
)

result = agent.invoke({"messages": [("human", "What's the current price of ETH?")]})
print(result["messages"][-1].content)
```

### RAG Pipeline

```python
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

llm = BlockRunLLM(model="anthropic/claude-sonnet-4.6")
embeddings = HuggingFaceEmbeddings()

vectorstore = Chroma(embedding_function=embeddings, persist_directory="./db")
retriever = vectorstore.as_retriever()

prompt = ChatPromptTemplate.from_template(
    "Answer based on context:\n{context}\n\nQuestion: {input}"
)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "input": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(rag_chain.invoke("How does x402 payment work?"))
```

## Multi-Model Chains

Use different models for different tasks:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

summarizer = BlockRunLLM(model="deepseek/deepseek-chat")
analyzer = BlockRunLLM(model="openai/gpt-5.4")

summary_prompt = ChatPromptTemplate.from_template("Summarize: {document}")
analysis_prompt = ChatPromptTemplate.from_template("Analyze this summary: {text}")

summary_chain = summary_prompt | summarizer | StrOutputParser()
analysis_chain = analysis_prompt | analyzer | StrOutputParser()

summary = summary_chain.invoke({"document": "..."})
analysis = analysis_chain.invoke({"text": summary})
```

## Cost Optimization

```python
# Use model routing based on task complexity
def get_model_for_task(task_type: str) -> str:
    if task_type == "simple":
        return "deepseek/deepseek-chat"  # $0.14/M input tokens
    elif task_type == "complex":
        return "openai/gpt-5.4"  # $2.50/M input tokens
    elif task_type == "reasoning":
        return "openai/o1"  # $15/M input tokens
    return "openai/gpt-5.4"

# Dynamic model selection
llm = BlockRunLLM(model=get_model_for_task("simple"))
```

Or let the SDK decide: the Python SDK's `smart_chat()` (bundled Router Core V3) picks the cheapest capable model per request — see [Smart Routing](../sdks/python.md#smart-routing-router-core) — and the sidecar accepts `blockrun/auto`, `blockrun/eco` and `blockrun/premium` as model ids.

## Async Support

The Python SDK ships an `AsyncLLMClient` with the same `chat()` signature:

```python
import asyncio
from blockrun_llm import AsyncLLMClient

class AsyncBlockRunLLM(BlockRunLLM):
    aclient: Any = None

    def __init__(self, model: str = "openai/gpt-5.4", **kwargs):
        super().__init__(model=model, **kwargs)
        self.aclient = AsyncLLMClient()

    async def _acall(self, prompt: str, stop: Optional[List[str]] = None, **kwargs) -> str:
        return await self.aclient.chat(self.model, prompt, stop=stop)

# Usage
async def main():
    llm = AsyncBlockRunLLM()
    result = await llm.ainvoke("Hello!")
    print(result)

asyncio.run(main())
```

With Path 1, `ChatOpenAI` already supports `ainvoke` / `astream`.

## Wallet Setup

BlockRun LLM uses your configured wallet:

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

Or create programmatically:

```python
from blockrun_llm import setup_agent_wallet

client = setup_agent_wallet()  # Creates ~/.blockrun/.session if none exists
print(f"Fund this address: {client.get_wallet_address()}")
```

See [Wallet Setup](../getting-started/wallet-setup.md).

## Pricing

Same as the BlockRun API — no markup on top of the gateway price. Live prices come from `https://blockrun.ai/api/v1/models`; a few examples (per 1M tokens, input/output):

| Model | Cost |
|-------|------|
| `openai/gpt-4o` | $2.50 / $10.00 |
| `deepseek/deepseek-chat` | $0.14 / $0.28 |
| `anthropic/claude-sonnet-4.6` | $3.00 / $15.00 |

See [Intelligence Pricing](../products/intelligence/pricing.md).

## Links

- [LangChain Documentation](https://python.langchain.com)
- [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) — the LiteLLM adapter and sidecar
- [BlockRun Python SDK](../sdks/python.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)

## What's next?

::::cards

:::card{title="BlockRun Python SDK" href="../sdks/python.md" icon="Code"}
Reference for the `LLMClient` that backs the custom LangChain provider.
:::

:::card{title="Wallet Setup" href="../getting-started/wallet-setup.md" icon="Wallet"}
Fund a wallet on Base or Solana before your first paid chain run.
:::

:::card{title="Intelligence Pricing" href="../products/intelligence/pricing.md" icon="TrendingUp"}
Per-model pricing so you can route cheap vs. premium by task.
:::

::::
