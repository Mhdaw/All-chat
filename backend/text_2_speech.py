from gtts import gTTS

language = "en"

def generate_speech(text = None, language = "en", name = "conversation"):
    myobj = gTTS(text=text, lang=language, slow=False)
    # Saving the converted audio
    myobj.save(f"{name}.mp3")
