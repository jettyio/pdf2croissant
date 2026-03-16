# Croissant Evaluation Experiment

Ground-truth examples for evaluating model ability to produce valid MLCommons Croissant metadata from academic papers.

Each subfolder contains:
- `paper.pdf` — the original academic paper (from arXiv)
- `croissant.json` — the ground-truth Croissant JSON-LD (from HuggingFace)

## Datasets

| Folder | Dataset | HuggingFace ID | arXiv | Croissant Version |
|--------|---------|---------------|-------|-------------------|
| `squad_v2` | SQuAD 2.0 | `rajpurkar/squad_v2` | [1806.03822](https://arxiv.org/abs/1806.03822) | 1.1 |
| `glue` | GLUE Benchmark | `nyu-mll/glue` | [1804.07461](https://arxiv.org/abs/1804.07461) | 1.0 |
| `wikitext` | WikiText | `Salesforce/wikitext` | [1609.07843](https://arxiv.org/abs/1609.07843) | 1.0 |
| `cnn_dailymail` | CNN/DailyMail | `abisee/cnn_dailymail` | [1506.03340](https://arxiv.org/abs/1506.03340) | 1.0 |
| `gsm8k` | GSM8K | `openai/gsm8k` | [2110.14168](https://arxiv.org/abs/2110.14168) | 1.1 |
