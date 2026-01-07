
import os
from gtts import gTTS

# Translations Data
audio_data = {
    "entrance": {
        "en": "The grand entrance featuring the massive monolithic Nandi statue facing the shrine.",
        "ta": "சன்னதியை எதிர்கொள்ளும் பிரமாண்டமான ஒற்றைக்கல் நந்தி சிலையுடன் கூடிய பிரதான நுழைவாயில்.",
        "kn": "ಗರ್ಭಗುಡಿ ಎದುರಿಸುತ್ತಿರುವ ಬೃಹತ್ ಏಕಶಿಲಾ ನಂದಿ ವಿಗ್ರಹವನ್ನು ಒಳಗೊಂಡಿರುವ ಭವ್ಯ ಪ್ರವೇಶದ್ವಾರ.",
        "hi": "गर्भगृह के सामने विशाल अखंड नंदी प्रतिमा वाला भव्य प्रवेश द्वार।"
    },
    "main_shrine": {
        "en": "The main sanctum sanctorum housing the colossal Shiva Lingam, similar to Thanjavur.",
        "ta": "தஞ்சாவூரைப் போலவே மிகப்பெரிய சிவலிங்கம் அமைந்துள்ள பிரதான கருவறை.",
        "kn": "ತಂಜಾವೂರಿನಂತೆಯೇ ಬೃಹತ್ ಶಿವಲಿಂಗವನ್ನು ಹೊಂದಿರುವ ಮುಖ್ಯ ಗರ್ಭಗುಡಿ.",
        "hi": "मुख्य गर्भगृह जिसमें तंजावुर के समान विशाल शिव लिंग है।"
    },
    "vimana_view": {
        "en": "A perfect view of the 55-meter high curvilinear Vimana, showing its unique concave structure.",
        "ta": "55 மீட்டர் உயரமுள்ள வளைந்த விமானத்தின் சரியான காட்சி, அதன் தனித்துவமான குழிவான அமைப்பைக் காட்டுகிறது.",
        "kn": "55 ಮೀಟರ್ ಎತ್ತರದ ವಕ್ರರೇಖೆಯ ವಿಮಾನದ ಪರಿಪೂರ್ಣ ನೋಟ, ಅದರ ವಿಶಿಷ್ಟ ನಿಮ್ನ ರಚನೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.",
        "hi": "55 मीटर ऊंचे वक्र विमान का एक आदर्श दृश्य, जो इसकी अनूठी अवतल संरचना को दर्शाता है।"
    },
    "lion_well": {
        "en": "The famous lion-faced well entrance, said to be used by the King to pour heavy Ganges water.",
        "ta": "புகழ்பெற்ற சிங்க முகம் கொண்ட கிணறு நுழைவாயில், கங்கை நீரை ஊற்ற மன்னரால் பயன்படுத்தப்பட்டதாக கூறப்படுகிறது.",
        "kn": "ಪ್ರಸಿದ್ಧ ಸಿಂಹದ ಮುಖದ ಬಾವಿ ಪ್ರವೇಶದ್ವಾರ, ರಾಜನು ಗಂಗಾ ನೀರನ್ನು ಸುರಿಯಲು ಬಳಸುತ್ತಿದ್ದನೆಂದು ಹೇಳಲಾಗುತ್ತದೆ.",
        "hi": "प्रसिद्ध शेरमुख कुआं प्रवेश द्वार, कहा जाता है कि राजा इसका उपयोग गंगा का पानी डालने के लिए करते थे।"
    },
    "mandapam": {
        "en": "The pillared hall with intricate Chola sculptures and artworks adorning the walls.",
        "ta": "சுவர்களில் சிக்கலான சோழர் சிற்பங்கள் மற்றும் கலைப்படைப்புகளுடன் கூடிய தூண்கள் கொண்ட மண்டபம்.",
        "kn": "ಗೋಡೆಗಳನ್ನು ಅಲಂಕರಿಸುವ ಸಂಕೀರ್ಣವಾದ ಚೋಳ ಶಿಲ್ಪಗಳು ಮತ್ತು ಕಲಾಕೃತಿಗಳನ್ನು ಹೊಂದಿರುವ ಕಂಬದ ಮಂಟಪ.",
        "hi": "दीवारों को सुशोभित करने वाली जटिल चोल मूर्तियों और कलाकृति वाला स्तंभ हॉल।"
    }
}

def generate_audio():
    # Ensure directory exists
    output_dir = "public/VR/gangaikondacholapuram/audio"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Generating audio files in '{output_dir}'...")

    for location, languages in audio_data.items():
        for lang, text in languages.items():
            filename = f"{location}_{lang}.mp3"
            filepath = os.path.join(output_dir, filename)
            
            print(f"Generating {filename}...")
            
            try:
                # 'ta' for Tamil, 'kn' for Kannada, 'hi' for Hindi, 'en' for English
                tts = gTTS(text=text, lang=lang, slow=False)
                tts.save(filepath)
                print(f"Saved: {filepath}")
            except Exception as e:
                print(f"Error generating {filename}: {e}")

    print("Audio generation complete!")

if __name__ == "__main__":
    generate_audio()
