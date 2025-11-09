#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/backend/.venv"

echo "📦 Installing frontend dependencies..."
cd "$ROOT_DIR"
npm install

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN=python3
else
  PYTHON_BIN=python
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "🐍 Creating backend virtual environment..."
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

echo "📚 Installing backend requirements..."
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$ROOT_DIR/backend/requirements.txt"

echo ""
echo "✅ Setup complete."
echo "To run the backend later, activate the venv with:"
echo "    source backend/.venv/bin/activate"
