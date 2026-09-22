import { PitchDeck, PitchDeckSchema } from "../schemas/pitch-deck-schema";
import { pitchDeckAgent } from "./pitch-deck-agent";
import { parseJsonObject } from "./parse-json";
import {InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered, run} from "@openai/agents";

class generatePitchDeckError extends Error {
    constructor(message: string | unknown) {
        super(typeof message === "string" ? message : JSON.stringify(message));
        this.name = "generatePitchDeckError";
        this.message = typeof message === "string" ? message : JSON.stringify(message);
    }
}
function isGuardrailError(error: unknown):boolean {
    return (
        error instanceof InputGuardrailTripwireTriggered ||
        error instanceof OutputGuardrailTripwireTriggered
    )
}

function getGuardrailErrorReason(error: unknown):string {
    console.log("getGuardrailErrorReason", error);
    if(error instanceof InputGuardrailTripwireTriggered){
        const info = error.result.output.outputInfo as {reason: string}|undefined;
        return info?.reason || "Input guardrail triggered";
    }
    else   if(error instanceof OutputGuardrailTripwireTriggered){
        const info = error.result.output.outputInfo as {reason: string}|undefined;
        return info?.reason || "Output guardrail triggered";
    }
    return "Unknown guardrail error encountered!";
}

//parse the agent result according to the schema -TO-DO: Implement this

function ParseAgentResult(result: unknown): PitchDeck {
    return PitchDeckSchema.parse(parseJsonObject(result));
}
export async function generatePitchDeck(idea: string) {
    try{
        const agentResult = await run(pitchDeckAgent, idea);
        console.log("GENERATE PITCH DECK AGENT RESULT",agentResult);
        return ParseAgentResult(agentResult.finalOutput);
    }
    catch(error:unknown){
       //if error is an instance of guardrail error, then throw a new error with the guardrail error reason
       if(isGuardrailError(error)){
       const guardrailErrorReason = getGuardrailErrorReason(error);
       throw new generatePitchDeckError(guardrailErrorReason);
       }
       //if error is an instance of any other type, return the error message
       throw  new generatePitchDeckError(error);
    }
}