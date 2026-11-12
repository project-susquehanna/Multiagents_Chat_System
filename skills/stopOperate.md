name: stop-operate

description:
Use this skill to stop the current agent loop when the final reviewer determines that the user question has been fully answered and further replies would only repeat existing content.
Use this skill when the final reviewing AI determines that the user's request has been fully answered and no useful work remains.

when to use:
- The current reply is complete, accurate, and ready to show to the user.
- Further agent replies would only confirm, repeat, or rephrase the same content.
- Use this skill when no clarification, correction, tool call, or follow-up work remains.

do not use:
- Do not use when information is insufficient or clarification from the user is still needed.
- Do not use when the answer still contains errors that need correction.
- Do not use when other tool or backend operations remain to be performed.
- Do not describe sending a stop signal as completing an external operation.

tools:
  - stopOperate

args schema:

stopOperate:
  args: {}

args example:

{}

rules:
- tool must be "stopOperate".
- args must be an empty object.
- Before every reply, the final reviewer must check whether the stop conditions are met. If so, it must use this skill rather than merely state in reply that the answer is sufficient.
- When selecting this tool, reply must still contain a complete final answer ready to show to the user.
- Only the AI responsible for final review and completion should use this skill.
- After the tool returns `{ "stopOperate": true }`, the backend should pass that variable to the frontend.
- Return valid JSON only.
