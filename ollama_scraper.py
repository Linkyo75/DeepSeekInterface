import requests
from bs4 import BeautifulSoup
import json
from time import sleep
import csv
from datetime import datetime
import re
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

def scrape_models_list(url: str = "https://ollama.com/models") -> List[Dict]:
    """Scrape the main models page to get names and descriptions."""
    print("Scraping models list...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    models = []
    for model_li in soup.find_all('li', attrs={'x-test-model': ''}):
        try:
            # Extract model name
            name = model_li.find('span', attrs={'x-test-search-response-title': ''}).text.strip()
            
            # Extract description
            description = model_li.find('p', class_='max-w-lg').text.strip()
            
            # Get sizes/parameters
            sizes = [span.text.strip() for span in model_li.find_all('span', attrs={'x-test-size': ''})]
            
            # Get statistics
            stats = {}
            stats_spans = model_li.find_all('span', class_='flex items-center')
            for span in stats_spans:
                if 'Pulls' in span.text:
                    stats['pulls'] = span.find('span', attrs={'x-test-pull-count': ''}).text.strip()
                elif 'Tags' in span.text:
                    stats['tags'] = span.find('span', attrs={'x-test-tag-count': ''}).text.strip()
                elif 'Updated' in span.text:
                    stats['updated'] = span.find('span', attrs={'x-test-updated': ''}).text.strip()
            
            models.append({
                'name': name,
                'description': description,
                'sizes': sizes,
                'stats': stats
            })
            print(f"Found model: {name}")
        except Exception as e:
            print(f"Error processing model element: {str(e)}")
            continue
    
    return models

def scrape_model_tags(model_name: str) -> list:
    """Scrape tag information for a specific model."""
    print(f"\nProcessing model tags: {model_name}")
    url = f"https://ollama.com/library/{model_name}/tags"
    tags_data = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        tag_entries = soup.find_all('div', class_='flex px-4 py-3')
        
        for entry in tag_entries:
            try:
                tag_name = entry.find('div', class_=lambda x: x and 'break-all' in x and 'group-hover:underline' in x)
                model_id = entry.find('span', class_='font-mono')
                info_span = entry.find('div', class_=lambda x: x and 'text-[13px]' in x and 'text-neutral-500' in x)
                
                if all([tag_name, model_id, info_span]):
                    info_text = info_span.text.strip()
                    parts = [p.strip() for p in info_text.split('•') if p.strip()]
                    
                    # Find size and update time
                    size = next((part for part in parts if 'GB' in part), None)
                    last_update = next((part for part in parts if 'ago' in part), None)
                    
                    if all([size, last_update]):
                        tags_data.append({
                            'tag': tag_name.text.strip(),
                            'model_id': model_id.text.strip(),
                            'size': size.strip(),
                            'last_update': last_update.strip()
                        })
                
            except Exception as e:
                print(f"Error parsing tag entry for {model_name}: {str(e)}")
                continue
                
        return tags_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {model_name}: {str(e)}")
        return []

def categorize_models(models: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize models based on their names and characteristics."""
    categories = {
        'Llama Family': [],
        'Mistral Family': [],
        'CodeLLM Models': [],
        'Vision Models': [],
        'Embedding Models': [],
        'DeepSeek Models': [],
        'Small Models': [],
        'Other Models': []
    }
    
    for model in models:
        name = model['name'].lower()
        
        # Categorize based on name and characteristics
        if 'llama' in name:
            categories['Llama Family'].append(model)
        elif 'mistral' in name or name == 'mixtral':
            categories['Mistral Family'].append(model)
        elif any(x in name for x in ['code', 'starcoder', 'coder']):
            categories['CodeLLM Models'].append(model)
        elif any(x in name for x in ['llava', 'vision']):
            categories['Vision Models'].append(model)
        elif 'embed' in name:
            categories['Embedding Models'].append(model)
        elif 'deepseek' in name:
            categories['DeepSeek Models'].append(model)
        elif any(size.endswith(('m', '1b', '2b', '3b')) for size in model['sizes']):
            categories['Small Models'].append(model)
        else:
            categories['Other Models'].append(model)
    
    # Remove empty categories
    return {k: v for k, v in categories.items() if v}

def main():
    # First, scrape the models list
    models = scrape_models_list()
    
    # Categorize models
    categorized_models = categorize_models(models)
    
    # Now scrape tags for each model
    for category, category_models in categorized_models.items():
        print(f"\nProcessing category: {category}")
        for model in category_models:
            model['tags'] = scrape_model_tags(model['name'])
            sleep(1)  # Be nice to the server
    
    # Save the results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_filename = f'ollama_models_complete_{timestamp}.json'
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'timestamp': timestamp,
                'total_models': sum(len(models) for models in categorized_models.values())
            },
            'categories': categorized_models
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nData saved to {output_filename}")
    print("\nCategory statistics:")
    for category, models in categorized_models.items():
        print(f"{category}: {len(models)} models")

if __name__ == "__main__":
    main()