import json
import os
import sys

def format_coverage_row(name, total, covered, pct):
    color = "red"
    if pct >= 80:
        color = "green"
    elif pct >= 50:
        color = "orange"
    
    bar_length = 10
    filled_length = int(bar_length * pct / 100)
    bar = "█" * filled_length + "░" * (bar_length - filled_length)
    
    return f"| {name} | {total} | {covered} | {pct:.1f}% |"

def process_client_coverage(file_path):
    if not os.path.exists(file_path):
        return None
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        total = data.get('total', {})
        lines = total.get('lines', {})
        
        return {
            'total': lines.get('total', 0),
            'covered': lines.get('covered', 0),
            'pct': lines.get('pct', 0)
        }
    except Exception as e:
        print(f"Error reading client coverage: {e}")
        return None

def process_server_coverage(file_path):
    if not os.path.exists(file_path):
        return None
        
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        totals = data.get('totals', {})
        
        pct = totals.get('percent_covered', 0)
        
        return {
            'total': totals.get('num_statements', 0),
            'covered': totals.get('covered_lines', 0),
            'pct': pct
        }
    except Exception as e:
        print(f"Error reading server coverage: {e}")
        return None

def main():
    client_path = os.environ.get('INPUT_CLIENT_COVERAGE_PATH', 'client/coverage/coverage-summary.json')
    server_path = os.environ.get('INPUT_SERVER_COVERAGE_PATH', 'server/coverage.json')
    
    client_stats = process_client_coverage(client_path)
    server_stats = process_server_coverage(server_path)
    
    summary = "## 📊 Code Coverage Report\n\n"
    summary += "| Component | Total Statements | Covered | Percentage |\n"
    summary += "| :--- | :---: | :---: | :---: |\n"
    
    if client_stats:
        summary += format_coverage_row("Client (React)", client_stats['total'], client_stats['covered'], client_stats['pct']) + "\n"
    else:
        summary += "| Client (React) | N/A | N/A | N/A |\n"
        
    if server_stats:
        summary += format_coverage_row("Server (Django)", server_stats['total'], server_stats['covered'], server_stats['pct']) + "\n"
    else:
        summary += "| Server (Django) | N/A | N/A | N/A |\n"
        
    step_summary_file = os.environ.get('GITHUB_STEP_SUMMARY')
    if step_summary_file:
        with open(step_summary_file, 'a') as f:
            f.write(summary)
    else:
        print(summary)

if __name__ == "__main__":
    main()
