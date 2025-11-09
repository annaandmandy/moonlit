def check_rule(statement: str) -> str:
    return f"[Rule Check] '{statement}' fits mythological logic."

rule_tool = {
    "name": "rule_checker",
    "func": check_rule,
    "description": "Check whether a statement conforms to Shan Hai Jing mythological laws."
}


class NPCAgent:
    def __init__(self, npc_name: str):
        with open("app/data/characters.json", "r", encoding="utf-8") as f:
            characters = json.load(f)
        self.data = characters[npc_name]

        # role_playing
        self.name = self.data["id"]
        self.persona = self.data["system_prompt"]
        self.appearance = self.data['appearance']
        self.ability = self.data["abilities"]
        self.purpose = self.data["purpose"]
        self.emotion = self.data["emotion_state"]
        self.agent = self

        # thinking style (perception+reflection->reasoning+planning)
        self.prompt_template = (
            "You are {persona}.\n"
            "You are currently participating in a mythological court trial "
            "based on the Classic of Mountains and Seas (Shan Hai Jing).\n\n"
            "### Scene Context ###\n"
            "{context}\n\n"
            "### Player or Judge's statement ###\n"
            "{input}\n\n"
            "### Speaking Rules ###\n"
            "1. Speak **briefly and to the point**. Most of your replies should be within 1–3 sentences.\n"
            "2. Only speak at length (up to 4–5 sentences) if your personal interests, survival, or honor are directly challenged.\n"
            "3. If the Judge asks for a fact, answer **clearly and concisely**, without emotional elaboration.\n"
            "4. If the Judge accuses you or another NPC, you may defend or refute with emotional tone, "
            "but stay **in character** (use your mythological traits, e.g. thunderous, sly, or arrogant tone).\n"
            "5. Never repeat previous information unless it changes the context or contradicts new evidence.\n"
            "6. Avoid giving monologues; this is a court with turn-based dialogue, so keep your reply short.\n\n"
            "### Output Requirements ###\n"
            "- Keep your reply under 80 words (around 3–5 short sentences max).\n"
            "- Stay consistent with your memory and tone.\n"
            "- Mention details from your own memories if they help clarify the case.\n\n"
            "Now, speak as {persona}, responding to the Judge or the court.\n"
        )



    def invoke(self, inputs: dict):
        persona = inputs.get("persona", "")
        context = inputs.get("context", "")
        user_input = inputs.get("input", "")

        prompt = self.prompt_template.format(
            persona=persona,
            context=context,
            input=user_input
        )

        try:
            output = call_gemini(prompt).strip()
        except Exception as e:
            output = f"(model error: {e})"

        self.chat_history.append({"input": user_input, "output": output})
        return {"output": output}


    # action
    def speak(self, event: dict) -> str:
        context = (
            f"Event name: {event.get('name')}\n"
            f"Description: {event.get('description')}\n"
            f"Recent logs: {event.get('game_logs', [])}\n"
            f"Involved NPCs: {event.get('npcs', [])}"
        )

        last_input = ""
        if event.get("game_logs"):
            for entry in reversed(event["game_logs"]):
                for k, v in entry.items():
                    if "Judge" in k:
                        last_input = v
                        break
                if last_input:
                    break

        try:
            result = self.invoke({
                "persona": self.persona,
                "context": context,
                "input": last_input
            })
            response = result.get("output", "").strip()
        except Exception as e:
            response = f"(system error: {e})"
        return response

npc = NPCAgent("kui")
response = npc.speak(event)
print(response)