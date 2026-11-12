const { tool_registry } = require("./toolRegistry");

const skill_registry = {
    "history-manager": {
        file: "historyManager.md",
        tools: {
            searchHistory: tool_registry.searchHistory,
            deleteHistory: tool_registry.deleteHistory,
            clearHistory: tool_registry.clearHistory
        },
        toolPermissions: {
            searchHistory: ["data-provider"],
            deleteHistory: [],
            clearHistory: []
        },
        argsSchema: {
            searchHistory: {
                args: {
                    keyword: "string, required. Keywords for searching chat history. toolFunction receives the entire args object and reads args.keyword."
                }
            },
            deleteHistory: {
                args: {
                    id: "number, required. ID of the history record to delete. toolFunction receives the entire args object and reads args.id."
                }
            },
            clearHistory: {
                args: {}
            }
        },
        readOnly: true
    },
    "pdf-generator": {
        file: "PDFManager.md",
        tools: {
            generatePDF: tool_registry.generatePDF
        },
        toolPermissions: {
            generatePDF: ["data-provider"]
        },
        argsSchema: {
            generatePDF: {
                args: {
                    html: "string, required. Non-empty HTML content used to generate a PDF. toolFunction receives the entire args object and reads args.html.",
                    filename: "string, optional. Output PDF filename; a .pdf extension is recommended. toolFunction receives the entire args object and reads args.filename."
                }
            }
        },
        readOnly: false
    },
    "stop-operate": {
        file: "stopOperate.md",
        tools: {
            stopOperate: tool_registry.stopOperate
        },
        toolPermissions: {
            stopOperate: ["answer-reviewer"]
        },
        argsSchema: {
            stopOperate: {
                args: {}
            }
        },
        readOnly: true
    },
    "search-tavily": {
        file: "searchTavily.md",
        tools: {
            searchTavily: tool_registry.searchTavily
        },
        toolPermissions: {
            searchTavily: ["data-provider"]
        },
        argsSchema: {
            searchTavily: {
                args: {
                    keyword: "string, required. Concise, specific, non-empty Tavily search keywords."
                }
            }
        },
        readOnly: true
    }
};

module.exports = { skill_registry };
