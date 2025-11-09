# need choose npc before game
class gameAgent:
    def __init__(self, npc_list, event):

        # event
        self.event = event
        self.public_clue = "\n".join(f"{idx}. {c['clue']}" for idx, c in enumerate(event["p_clues"], start=1))
        self.public_dialogue = event['game_logs']

        # characters
        with open("app/data/characters.json", "r", encoding="utf-8") as f:
            characters = json.load(f)
        if npc_list == None:
            self.npc_list = event['npcs']
        else:
            self.npc_list = npc_list
        self.visual = {char_id: char_data["appearance"] for char_id, char_data in characters.items()}
        self.ability = {char_id: char_data["abilities"] for char_id, char_data in characters.items()}

        # game_status
        self.trail = True

    def process(self):
        print(f"Chapter 1 - Event trail start: {self.event['name']}")
        print(f"Clue Board:\n{self.public_clue}")

    # globally decide who speak next
    def pick_next_speaker(self):
        context = f"""
            The Event name: {self.event['name']}.
            The Case Description: {self.event['description']}.
            Previous Game Conversation: {self.public_dialogue}
        """
        result = call_gemini(f"""
            You are a game organizer. 
            Based on the previous game conversation content, select the next speaker from the {self.npc_list}. 
            You should prioritize Judge's requirements.
            If the judge does not explicitly point it out, analyze through the content of the conversation who is more suitable to speak at this time. 
            It might have been mentioned by another character, or the content of the conversation implies that it is related to the character.
            If there is no clear direction, please analyze the dialogue content and select the speaker who can best provoke the plot twist.
            One character cannot continuously speak more than 2 rounds.
            Dialogue content:{context}, npc_list:{self.npc_list}, please only output the name of your choice, for example: 'Next speaker: Baize'.
            Next speaker: 
        """)
        last_index = -1
        last_npc = self.npc_list[0]
        for npc in self.npc_list:
            idx = str(result).lower().rfind(npc)
            if idx > last_index:
                last_index = idx
                last_npc = npc
        return last_npc

    # user action
    def user_act(self, choice):
        if choice == 1: # pass to agent
            cur_npc = self.pick_next_speaker()
        elif choice == 2: # choose char to speak
            lines = " ".join(f"{idx}. {c}" for idx, c in enumerate(self.npc_list, start=1))
            print(f"please choose the speaker:\n{lines}")
            idx = input("input the speaker index number (1 or 2 or 3...): ").strip()
            cur_npc = self.npc_list[int(idx) - 1]
        elif choice == 3: # choose to speak
            user_dia = input("please say something: ").strip()
            self.public_dialogue.append({"Judge(player)":f"{user_dia}"})
            cur_npc = self.pick_next_speaker()
        else:
            print("User action wrong - user_act")
        return cur_npc

    # agent action
    def char_act(selfcur_npc):
        char_dia = speak(cur_npc)
        self.public_dialogue.append({f"{cur_npc}":f"{char_dia}"})
        return event

    def speak(cur_npc):
        npc = NPCAgent(cur_npc)
        char_dia = npc.speak(event)
        print(char_dia)
        return char_dia

# import random
# while trail_start:
#     choice = random.choice([1,2,3])
#     event, cur_npc = user_act(event, choice)
#     event = char_act(cur_npc)