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

    # Calculate overall percentage
    total_lines = 0
    covered_lines = 0
    if client_stats:
        total_lines += client_stats['total']
        covered_lines += client_stats['covered']
    if server_stats:
        total_lines += server_stats['total']
        covered_lines += server_stats['covered']
    
    overall_pct = 0
    if total_lines > 0:
        overall_pct = (covered_lines / total_lines) * 100
        
    generate_badge(overall_pct, 'coverage.svg')

    # Write to GITHUB_STEP_SUMMARY
    step_summary_file = os.environ.get('GITHUB_STEP_SUMMARY')
    if step_summary_file:
        with open(step_summary_file, 'a') as f:
            f.write(summary)
    else:
        print(summary)

    # Check minimum coverage
    min_coverage = float(os.environ.get('INPUT_MIN_COVERAGE', '0'))
    if overall_pct < min_coverage:
        print(f"::error::Overall coverage {overall_pct:.1f}% is below the minimum threshold of {min_coverage}%")
        sys.exit(1)

def generate_badge(pct, filepath):
    color = "#e05d44" # red
    if pct >= 80:
        color = "#4c1" # green
    elif pct >= 50:
        color = "#dfb317" # yellow
        
    pct_str = f"{pct:.0f}%"
    
    # Simple SVG template
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="90" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="90" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h55v20H0z"/>
    <path fill="{color}" d="M55 0h35v20H55z"/>
    <path fill="url(#b)" d="M0 0h90v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="28.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="28.5" y="14">coverage</text>
    <text x="71.5" y="15" fill="#010101" fill-opacity=".3">{pct_str}</text>
    <text x="71.5" y="14">{pct_str}</text>
  </g>
</svg>"""
    
    with open(filepath, 'w') as f:
        f.write(svg)

def generate_badge(pct, filepath):
    color = "#e05d44" # red
    if pct >= 80:
        color = "#4c1" # green
    elif pct >= 50:
        color = "#dfb317" # yellow
        
    pct_str = f"{pct:.0f}%"
    
    # Simple SVG template
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="90" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="90" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h55v20H0z"/>
    <path fill="{color}" d="M55 0h35v20H55z"/>
    <path fill="url(#b)" d="M0 0h90v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="28.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="28.5" y="14">coverage</text>
    <text x="71.5" y="15" fill="#010101" fill-opacity=".3">{pct_str}</text>
    <text x="71.5" y="14">{pct_str}</text>
  </g>
</svg>"""
    
    with open(filepath, 'w') as f:
        f.write(svg)


if __name__ == "__main__":
    main()
