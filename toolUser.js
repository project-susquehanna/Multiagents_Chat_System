const { skill_registry } = require("./skillRegistry");

async function toolUser(agentRole, skill, tool, args = {}, context = {}){
    try{
        if (skill === "none" && tool === "none") {
            return undefined;
        }

        const trySkill = skill_registry[skill];
        if (!trySkill) {
            throw new Error(`Skill does not exist: ${skill}`);
        }

        const toolFunction = trySkill.tools[tool];
        if (!toolFunction) {
            throw new Error(`Tool does not belong to skill ${skill}: ${tool}`);
        }

        const allowedAgents = trySkill.toolPermissions?.[tool] || [];
        if (!allowedAgents.includes(agentRole)) {
            throw new Error(`${agentRole} is not allowed to call tool: ${tool}`);
        }

        if (skill === "history-manager") {
            if (!context.userId) {
                throw new Error("Please sign in to use history tools");
            }
            return await toolFunction(args, context.userId);
        }

        return await toolFunction(args);
    }catch(error){
        console.error(error.message);
        throw error;
    }
}

module.exports = { toolUser };
