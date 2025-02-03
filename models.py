import requests
from bs4 import BeautifulSoup
import json
from time import sleep
import csv
from datetime import datetime
import re

def extract_size_and_update(info_text: str) -> tuple:
    """Extract size and update time from the info text."""
    print(f"Processing info text: {info_text}")
    # Split by bullet points and clean up
    parts = [p.strip() for p in info_text.split('•') if p.strip()]
    print(f"Split parts: {parts}")
    
    # Find size (should be the first part that contains 'GB')
    size = next((part for part in parts if 'GB' in part), None)
    # Find update time (should be the part that contains 'ago')
    last_update = next((part for part in parts if 'ago' in part), None)
    
    print(f"Found size: {size}, last update: {last_update}")
    return size, last_update

def scrape_model_tags(model_name: str) -> list:
    """Scrape tag information for a specific model."""
    print(f"\nProcessing model: {model_name}")
    url = f"https://ollama.com/library/{model_name}/tags"
    tags_data = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        print(f"Fetching URL: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all tag entries
        tag_entries = soup.find_all('div', class_='flex px-4 py-3')
        print(f"Found {len(tag_entries)} tag entries")
        
        for entry in tag_entries:
            try:
                print("\nProcessing new tag entry:")
                print(entry.prettify())
                
                # Get tag name
                tag_name_div = entry.find('div', class_=lambda x: x and 'break-all' in x and 'group-hover:underline' in x)
                if not tag_name_div:
                    print("Could not find tag name div")
                    continue
                tag_name = tag_name_div.text.strip()
                print(f"Found tag name: {tag_name}")
                
                # Get model ID
                model_id_span = entry.find('span', class_='font-mono')
                if not model_id_span:
                    print("Could not find model ID span")
                    continue
                model_id = model_id_span.text.strip()
                print(f"Found model ID: {model_id}")
                
                # Get the info text containing size and update time
                info_span = entry.find('div', class_=lambda x: x and 'text-[13px]' in x and 'text-neutral-500' in x)
                if not info_span:
                    print("Could not find info span")
                    continue
                    
                info_text = info_span.text.strip()
                print(f"Found info text: {info_text}")
                
                size, last_update = extract_size_and_update(info_text)
                print(f"Extracted size: {size}, last update: {last_update}")
                
                if all([tag_name, model_id, size, last_update]):
                    data = {
                        'model': model_name,
                        'tag': tag_name,
                        'model_id': model_id,
                        'size': size,
                        'last_update': last_update
                    }
                    print(f"Adding data: {data}")
                    tags_data.append(data)
                
            except Exception as e:
                print(f"Error parsing tag entry: {str(e)}")
                continue
        
        if tags_data:
            print(f"\nSuccessfully scraped {len(tags_data)} tags for {model_name}")
        else:
            print(f"No valid tags found for {model_name}")
            
        return tags_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {model_name}: {str(e)}")
        return []

def main():
    # Let's start with just one model for testing
    models = ["deepseek-r1", "llama3.3", "phi4", "llama3.2", "llama3.1", "nomic-embed-text", "mistral", "llama3", "qwen", "gemma", "qwen2", "qwen2.5", "llama2", "phi3", "llava", "gemma2", "qwen2.5-coder", "codellama", "tinyllama", "mxbai-embed-large", "mistral-nemo", "llama3.2-vision", "starcoder2", "snowflake-arctic-embed", "mixtral", "deepseek-coder-v2", "dolphin-mixtral", "phi", "codegemma", "deepseek-coder", "llama2-uncensored", "wizardlm2", "dolphin-mistral", "all-minilm", "bge-m3", "dolphin-llama3", "command-r", "orca-mini", "yi", "llava-llama3", "zephyr", "phi3.5", "codestral", "starcoder", "granite-code", "vicuna", "wizard-vicuna-uncensored", "smollm", "mistral-openorca", "qwq", "deepseek-v3", "llama2-chinese", "smollm2", "openchat", "codegeex4", "aya", "codeqwen", "nous-hermes2", "mistral-large", "command-r-plus", "stable-code", "openhermes", "deepseek-llm", "tinydolphin", "glm4", "wizardcoder", "qwen2-math", "bakllava", "stablelm2", "reflection", "deepseek-v2", "moondream", "neural-chat", "llama3-gradient", "wizard-math", "minicpm-v", "llama3-chatqa", "sqlcoder", "mistral-small", "xwinlm", "nous-hermes", "dolphincoder", "phind-codellama", "yarn-llama2", "hermes3", "solar", "wizardlm", "starling-lm", "yi-coder", "llava-phi3", "internlm2", "athene-v2", "falcon", "samantha-mistral", "orca2", "nemotron", "dolphin-phi", "nemotron-mini", "stable-beluga", "wizardlm-uncensored", "llama3-groq-tool-use", "granite3-dense", "granite3.1-dense", "medllama2", "llama-pro", "yarn-mistral", "dolphin3", "meditron", "nexusraven", "nous-hermes2-mixtral", "smallthinker", "codeup", "everythinglm", "granite3-moe", "aya-expanse", "magicoder", "falcon2", "stablelm-zephyr", "codebooga", "bge-large", "mathstral", "wizard-vicuna", "mistrallite", "reader-lm", "duckdb-nsql", "marco-o1", "falcon3", "solar-pro", "megadolphin", "notux", "shieldgemma", "open-orca-platypus2", "notus", "goliath", "llama-guard3", "bespoke-minicheck", "granite3.1-moe", "nuextract", "opencoder", "snowflake-arctic-embed2", "deepseek-v2.5", "firefunction-v2", "olmo2", "dbrx", "exaone3.5", "paraphrase-multilingual", "alfred", "granite3-guardian", "tulu3", "command-r7b", "granite-embedding", "sailor2"]
    
    all_data = []
    failed_models = []
    
    for model in models:
        try:
            print(f"\n{'='*50}")
            print(f"Processing model: {model}")
            print(f"{'='*50}")
            
            data = scrape_model_tags(model)
            if data:
                all_data.extend(data)
                print(f"Successfully processed {model} - found {len(data)} tags")
            else:
                failed_models.append(model)
                print(f"No data retrieved for {model}")
                
        except Exception as e:
            failed_models.append(model)
            print(f"Error processing {model}: {str(e)}")
        
        # Be nice to the server
        sleep(1)
    
    # Save to CSV
    if all_data:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        csv_filename = f'ollama_models_{timestamp}.csv'
        json_filename = f'ollama_models_{timestamp}.json'
        
        fieldnames = ['model', 'tag', 'model_id', 'size', 'last_update']
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_data)
        
        # Save as JSON for backup
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
            
        print(f"\nSuccessfully saved data for {len(all_data)} model tags")
        print(f"Data saved to {csv_filename} and {json_filename}")
        
        if failed_models:
            print(f"Failed models: {', '.join(failed_models)}")

if __name__ == "__main__":
    main()