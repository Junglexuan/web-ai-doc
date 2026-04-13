import re

file_path = 'packages/doc/src/modules/dueDiligence/views/Item/index.module.less'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
in_target_section = False

for i, line in enumerate(lines):
    # Enable replacement when we hit our newly added sections
    if '// AI 洞察视图容器' in line or '.qListContainer {' in line or ':local(.qListContainer) {' in line or ':local(.questionRow) {' in line or '.qToolbar {' in line or ':local(.qToolbar) {' in line or '.addQuestionRow {' in line:
        in_target_section = True
        
    if in_target_section:
        # Stop replacement at the end of our sections
        if ':local(.tplSelectItem) {' in line:
            in_target_section = False
            
    if in_target_section:
        # Match class selectors like: .className {
        # But not global(.ant-something) or :local(.something)
        # Also handle &.something or :global
        
        # Regex to find standard LESS class selectors (e.g., .aiViewHeader { or .cardStatusBadge {)
        # It should ignore .ant-btn-disabled, etc if they are inside :global
        line = re.sub(r'(?<!:local\()(\s*)\.([a-zA-Z0-9_-]+)(?=\s*\{)', r'\1:local(.\2)', line)
        
        # Also handle &.classname {
        line = re.sub(r'(?<!:local\()(\s*)&__*?\.([a-zA-Z0-9_-]+)(?=\s*\{)', r'\1:local(&.\2)', line) 
        # Actually in less, &.active usually becomes &.active, which we want to be .active exported?
        # No, if it's concatenated, it usually works if the base is local.
        # So we just do `&.active` -> `&:local(.active)`
        line = re.sub(r'&\.([a-zA-Z0-9_-]+)(?=\s*\{)', r'&:local(.\1)', line)

    new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)
