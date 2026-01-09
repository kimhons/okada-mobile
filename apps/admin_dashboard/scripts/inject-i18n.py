#!/usr/bin/env python3
"""
Automated i18n injection script for remaining pages
Injects useTranslation and useI18nLoader hooks into page components
"""

import re
import sys

def inject_i18n_imports(content: str) -> str:
    """Add i18n imports after existing imports"""
    # Find the last import statement
    import_pattern = r'(import .+ from .+;)\n(?!import)'
    
    i18n_imports = '''import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";

'''
    
    # Check if i18n imports already exist
    if 'useTranslation' in content and 'useI18nLoader' in content:
        return content
    
    # Insert after last import
    content = re.sub(import_pattern, r'\1\n' + i18n_imports, content, count=1)
    return content

def inject_i18n_hooks(content: str, namespace: str) -> str:
    """Add i18n hooks at the start of component function"""
    # Find component function start (after function declaration)
    component_pattern = r'(export default function \w+\(\) \{)\n'
    
    hooks = f'''  const {{ t }} = useTranslation("{namespace}");
  useI18nLoader(["{namespace}"]);

'''
    
    # Check if hooks already exist
    if f'useTranslation("{namespace}")' in content:
        return content
    
    # Insert hooks after function declaration
    content = re.sub(component_pattern, r'\1\n' + hooks, content, count=1)
    return content

def process_file(filepath: str, namespace: str):
    """Process a single file to inject i18n"""
    print(f"Processing {filepath} with namespace '{namespace}'...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Inject imports
        content = inject_i18n_imports(content)
        
        # Inject hooks
        content = inject_i18n_hooks(content, namespace)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Successfully processed {filepath}")
        return True
    
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    files_to_process = [
        ("/home/ubuntu/okada-admin/client/src/pages/NotificationsCenter.tsx", "notifications"),
        ("/home/ubuntu/okada-admin/client/src/pages/Analytics.tsx", "analytics"),
        ("/home/ubuntu/okada-admin/client/src/pages/promotional-campaigns.tsx", "campaigns"),
    ]
    
    success_count = 0
    for filepath, namespace in files_to_process:
        if process_file(filepath, namespace):
            success_count += 1
    
    print(f"\n✅ Processed {success_count}/{len(files_to_process)} files successfully")
    return 0 if success_count == len(files_to_process) else 1

if __name__ == "__main__":
    sys.exit(main())
