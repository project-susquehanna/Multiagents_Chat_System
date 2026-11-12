---
name: history-manager
description:
Prefer searchHistory when the user needs to search, view, review, or summarize chat history.
Use this skill to search, review, or summarize chat history.
Only use deleteHistory or clearHistory when the user explicitly asks to delete records.

tools:
  - searchHistory
  - deleteHistory
  - clearHistory
---

# History Manager

## purpose

This skill manages chat history.
This skill manages chat history records.

It can:

- Search history by keyword
- View previously discussed content
- Summarize history based on search results
- Delete a specified history record
- Clear all history

## when to use searchHistory

Use `searchHistory` when the user asks about previous conversations or wants to find a topic.

Use `searchHistory` when the user wants to:

- Find what was discussed previously
- Check whether a topic was discussed previously
- Review previous content
- Summarize previous chat history
- Find content mentioned previously
- search chat history
- review previous conversations
- summarize previous chat history

Important rules:

- Use only `searchHistory` for ordinary history searches, reviews, or summaries.
- Do not use `deleteHistory` or `clearHistory` for search, review, or summary requests.
- Do not interpret history searches, reviews, or summaries as requests to delete or clear history.
- If the user asks “What did we discuss previously?”, use `searchHistory`.
- If the user asks “Have we discussed this topic before?”, use `searchHistory`.

args schema:

searchHistory:
  args:
    keyword: string, required. Keywords for searching chat history. toolFunction receives the entire args object and reads args.keyword.

args example:

{
  "keyword": "database indexes performance optimization"
}

reply rules:

- Answer the user based on the tool results.
- If no results are found, clearly state that there are no matching history records.
- Do not invent content that does not exist in the database.

## when to use deleteHistory

Use `deleteHistory` only when the user explicitly requests deletion of a specific chat record and provides or confirms its ID.

Use `deleteHistory` only when the user explicitly wants to delete one specific record.

Allowed examples:

- “Delete the record with ID 3”
- “Delete history record 5 for me”
- “Confirm deletion of this record”

Do not use deleteHistory when:

- The user only asks to view, search, review, summarize, or find something
- The user has not provided a specific ID
- The user only asks what was discussed previously

args schema:

deleteHistory:
  args:
    id: number, required. ID of the history record to delete. toolFunction receives the entire args object and reads args.id.

args example:

{
  "id": 3
}

rules:

- Obtain a specific record ID.
- Obtain user confirmation before deleting.
- Do not guess record IDs.
- Do not delete multiple records unless the user explicitly requests it.

## when to use clearHistory

Use `clearHistory` only when the user explicitly requests clearing or deleting all chat history.

Use `clearHistory` only when the user explicitly asks to clear or delete all chat history.

Allowed examples:

- “Clear all history”
- “Clear all chat records”
- “Delete all records”
- “Confirm clearing all history”

Do not use clearHistory when:

- The user only asks what was discussed previously
- The user only asks to summarize previous content
- The user only asks to look up chat history
- The user only asks to search for a topic

args schema:

clearHistory:
  args: {}

args example:

{}

rules:

- Clearly tell the user that this will delete all history.
- Obtain explicit user confirmation.
- Do not interpret deletion of a single record as clearing all history.
- Do not interpret searching or summarizing history as clearing all history.

## global rules

- tool must be one of: `searchHistory`, `deleteHistory`, `clearHistory`.
- args must strictly follow args schema.
- Do not rename `keyword` to query, text, content, or search.
- Do not rename `id` to recordId, messageId, number, or index.
- Search operations may run automatically.
- Deleting a single record and clearing all records both require user confirmation.
- Do not modify database data unrelated to chat history.
- Return only a small number of the most relevant results per search to avoid wasting tokens.
- Return valid JSON only.