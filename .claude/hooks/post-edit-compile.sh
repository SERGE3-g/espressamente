#!/bin/bash
# Hook: auto-compila il backend dopo ogni Edit/Write su file .java
# Riceve JSON su stdin con tool_input.file_path

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)

if [[ "$FILE_PATH" == *.java ]]; then
  cd /Users/sergeguea/Downloads/espressamente/backend
  JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home mvn compile -q 2>&1 | tail -5
fi
