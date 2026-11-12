class AgentOutputValidationError extends Error {
    constructor(message) {
        super(`Invalid model output: ${message}`);
        this.name = "AgentOutputValidationError";
        this.statusCode = 502;
        this.code = "INVALID_MODEL_OUTPUT";
    }
}

function parseAgentJson(content) {
    if (typeof content !== "string" || content.trim() === "") {
        throw new AgentOutputValidationError("Response is empty");
    }

    const text = content.trim();
    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");

        if (start === -1 || end <= start) {
            throw new AgentOutputValidationError("Response is not a valid JSON object");
        }

        try {
            parsed = JSON.parse(text.slice(start, end + 1));
        } catch {
            throw new AgentOutputValidationError("Response is not a valid JSON object");
        }
    }

    return validateAgentOutput(parsed);
}

function validateAgentOutput(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new AgentOutputValidationError("Top-level value must be a JSON object");
    }

    const requiredFields = ["skill", "tool", "args", "reply"];
    const unknownFields = Object.keys(value).filter(
        (field) => !requiredFields.includes(field)
    );
    if (unknownFields.length > 0) {
        throw new AgentOutputValidationError(
            `Disallowed fields: ${unknownFields.join(", ")}`
        );
    }

    for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(value, field)) {
            throw new AgentOutputValidationError(`Missing required field ${field}`);
        }
    }

    for (const field of ["skill", "tool", "reply"]) {
        if (typeof value[field] !== "string") {
            throw new AgentOutputValidationError(`Field ${field} must be a string`);
        }
        if (value[field].trim() === "") {
            throw new AgentOutputValidationError(`Field ${field} must not be empty`);
        }
    }

    if (
        value.args === null ||
        typeof value.args !== "object" ||
        Array.isArray(value.args)
    ) {
        throw new AgentOutputValidationError("Field args must be a JSON object");
    }

    if (value.skill === "none") {
        if (value.tool !== "none") {
            throw new AgentOutputValidationError(
                "tool must be none when skill is none"
            );
        }
        if (Object.keys(value.args).length !== 0) {
            throw new AgentOutputValidationError(
                "args must be an empty object when skill is none"
            );
        }
    } else if (value.tool === "none") {
        throw new AgentOutputValidationError(
            "tool must not be none when skill is not none"
        );
    }

    return {
        skill: value.skill,
        tool: value.tool,
        args: value.args,
        reply: value.reply
    };
}

module.exports = {
    AgentOutputValidationError,
    parseAgentJson,
    validateAgentOutput
};
