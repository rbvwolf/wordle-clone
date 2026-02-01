import json
from pathlib import Path
from wordfreq import zipf_frequency

script_path = Path(__file__).resolve()
project_path = script_path.parent.parent
wordlist_path = project_path / "data" / "words.json"

output_easy = project_path / "data" / "easy_words.json"
output_hard = project_path / "data" / "hard_words.json"
output_allwords = project_path / "data" / "clean_combined_words.json"

def filter_words():
    try:
        with open(wordlist_path, "r", encoding="utf-8") as file:
            all_words = json.load(file)
            
        easy_words = []
        hard_words = []
        
        print(f"All words length: {len(all_words)}")
        
        for word in all_words:
            clean_word = word.lower().replace('İ', 'i').replace('I', 'ı') #zipf lib works with lowercase letters
            
            score = zipf_frequency(clean_word, 'tr')
            
            if score >= 4:
                easy_words.append(word) #not clean_word
            elif score >= 1.5:
                hard_words.append(word)
                
        
        easy_hard_combine = easy_words + hard_words
        
        print(f"Lenght of lists: {len(easy_words)} Easy, {len(hard_words)} Hard and {len(easy_hard_combine)} all.")
        
        with open(output_easy, "w", encoding="utf-8") as file:
            json.dump(easy_words, file, ensure_ascii=False)
        
        with open(output_hard, "w", encoding="utf-8") as file:
            json.dump(hard_words, file, ensure_ascii=False)
            
        with open(output_allwords, "w", encoding="utf-8") as file:
            json.dump(easy_hard_combine, file, ensure_ascii=False)
            
        print("Compleated.")
    
    except Exception as error:
        print(f"Error occured: {error}")
        
filter_words()