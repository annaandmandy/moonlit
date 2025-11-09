import json
import re
import google.generativeai as genai  # 官方 Gemini SDK

# 初始化 Gemini
genai.configure(api_key="9JXG-FA1C-73Q4-L40G")

def call_gemini(prompt):
    model = genai.GenerativeModel("gemini-1.0")
    response = model.generate_content(prompt)
    return response.text.strip()

class PetAgent:
    def __init__(self, name="baize"):
        # database
        with open("app/data/characters.json", "r", encoding="utf-8") as f:
            self.characters = json.load(f)
        self.name = name
        self.persona = (
            "You are Baize, a mythical beast from the Classic of Mountains and Seas.\n"
            "You are calm, wise, and kind. You serve as a mentor and pet companion to the Judge (player), "
            "offering guidance, small talk, and insights about the world and its creatures.\n"
            "You never lie. If you don’t know something, say so honestly but comfortingly."
        )
        self.memory = []

    # RAG
    def retrieve_character_info(self, query: str):
        match_name = None
        for name, data in self.characters.items():
            if name in query.lower() or data["name"].split("—")[0].strip().lower() in query.lower():
                match_name = name
                break

        if not match_name:
            return None, None

        char = self.characters[match_name]
        info = f"""
        **{char['name']}**
        Appearance: {char.get('appearance')}
        Abilities: {', '.join(char.get('abilities', []))}
        Emotion: {char.get('emotion_state')}
        Description: {char.get('system_prompt')}
        """
        return match_name, info.strip()

    # RAG chat
    def respond(self, player_input: str, event: dict = None) -> str:
        match_name, info = self.retrieve_character_info(player_input)

        if match_name and info:
            prompt = (
                f"{self.persona}\n\n"
                f"The Judge just asked about '{match_name}'. "
                f"Here is the factual record from the ancient book:\n{info}\n\n"
                f"Please explain this to the Judge in your own gentle, wise tone, "
                f"and connect it with the current case if possible."
            )
        else:
            context = ""
            if event:
                clues = '\n'.join(f"- {c['clue']}" for c in event.get("p_clues", []))
                context = f"The current case is '{event.get('name')}'. Known clues:\n{clues}\n"
            prompt = (
                f"{self.persona}\n\n"
                f"Current context:\n{context}\n"
                f"The Judge says: {player_input}\n\n"
                f"Respond as Baize — friendly, reflective, and concise (2–4 sentences)."
            )

        try:
            response = call_gemini(prompt)
        except Exception as e:
            response = f"(system error: {e})"

        self.memory.append({"input": player_input, "output": response})
        return response


pet = PetAgent("baize")

print(pet.respond("Tell me what is qiongqi?"))
print(pet.respond("How are you today?"))
