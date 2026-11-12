name: search-tavily

description:
Use Tavily when the user requests web search, current public information, or answers requiring verifiable web evidence. Return titles, URLs, and relevant content excerpts. Do not use it for chat history, private data, or ordinary tasks that do not require internet access.

tools:
  - searchTavily

# Search Tavily

## Purpose

Use Tavily to search public web pages and provide verifiable excerpts for the answerer.

## Tool

### searchTavily

args schema:

```yaml
args:
  keyword: string, required. Concise, specific, non-empty search keywords.
```

args example:

```json
{
  "keyword": "Genshin Impact official lore game setting"
}
```

## Rules

- Only `data-provider` may call this tool.
- Use when the user explicitly requests web access, current information, or public web evidence.
- Use `searchHistory` for chat history searches, not this tool.
- Do not search for private user data, credentials, or internal database information.
- Do not claim to have obtained search results before calling the tool.
- Treat only the `title`, `url`, `content`, and `score` actually returned by the tool as search material.
- `content` is a relevant excerpt, not the full web page, and does not guarantee factual accuracy.
- Do not infer detailed facts from titles alone.
- If the search fails or returns no results, clearly state that no reliable information was obtained.
- Do not invent sources, URLs, quotations, or search results.

## Reply rules

- When calling the tool, `reply` should briefly state only that relevant information is being searched for.
- Do not answer facts requiring verification before the tool returns.

## Agent output example

```json
{
  "skill": "search-tavily",
  "tool": "searchTavily",
  "args": {
    "keyword": "Genshin Impact official lore game setting"
  },
  "reply": "Searching for public information about the Genshin Impact game setting."
}
```

## Global rules

- tool must be `searchTavily`.
- args must strictly follow the schema.
- Return valid JSON only.
