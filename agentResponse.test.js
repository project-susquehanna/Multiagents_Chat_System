const test = require("node:test");
const assert = require("node:assert/strict");
const {
    AgentOutputValidationError,
    parseAgentJson,
    validateAgentOutput
} = require("./agentResponse");

test("accepts a complete valid agent response", () => {
    assert.deepEqual(
        parseAgentJson('{"skill":"none","tool":"none","args":{},"reply":"Done"}'),
        { skill: "none", tool: "none", args: {}, reply: "Done" }
    );
});

test("rejects a missing reply instead of supplying a default", () => {
    assert.throws(
        () => validateAgentOutput({ skill: "none", tool: "none", args: {} }),
        (error) => {
            assert.equal(error instanceof AgentOutputValidationError, true);
            assert.equal(error.statusCode, 502);
            assert.match(error.message, /Missing required field reply/);
            return true;
        }
    );
});

test("rejects an empty reply", () => {
    assert.throws(
        () => validateAgentOutput({
            skill: "none",
            tool: "none",
            args: {},
            reply: "   "
        }),
        /Field reply must not be empty/
    );
});

test("rejects invalid field types and unknown fields", () => {
    assert.throws(
        () => validateAgentOutput({
            skill: "none",
            tool: "none",
            args: [],
            reply: "Done"
        }),
        /Field args must be a JSON object/
    );
    assert.throws(
        () => validateAgentOutput({
            skill: "none",
            tool: "none",
            args: {},
            reply: "Done",
            extra: true
        }),
        /Disallowed fields: extra/
    );
});

test("rejects inconsistent none fields", () => {
    assert.throws(
        () => validateAgentOutput({
            skill: "none",
            tool: "searchTavily",
            args: {},
            reply: "Searching"
        }),
        /tool must be none when skill is none/
    );
});
