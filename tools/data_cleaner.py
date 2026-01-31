import json
from pathlib import Path

script_path = Path(__file__).resolve()
project_path = script_path.parent.parent
file_path = project_path / "data" / "words.txt"

def data_clean(file_path):
    if not file_path.exists():
        print(f"Error: {file_path} doesnt exists.")
        return
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            raw_words = file.read().splitlines()
        
        cleaned_words = []
        
        for word in raw_words:
            word = word.strip()
            if(len(word) == 5):
                word = word.replace("i", "İ").replace("ı", "I")
                word = word.upper()
                if word.isalpha():
                    cleaned_words.append(word)
                    
        final_list = list(set(cleaned_words))
        
        output_path = project_path / "data" / "words.json"
        with open(output_path, "w", encoding="utf-8") as output:
            json.dump(final_list, output, ensure_ascii=False, indent=4)
            
        print(f"Success! {len(final_list)} words are extracted to: {output_path}")
    
    except Exception as error:
        print(f"An error occured: {error}")
        
data_clean(file_path)