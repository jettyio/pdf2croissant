---
version: "1.0.0"
evaluation: programmatic
agent: claude-code
model: claude-sonnet-4-6
snapshot: python312-uv
---

# PDF to MLCommons Croissant — Agent Runbook

## Objective

You are given an academic paper (PDF) that introduces or describes a machine learning dataset. Your job is to read and deeply understand the paper, extract all dataset metadata, produce a valid MLCommons Croissant JSON-LD file, validate it using the `mlcroissant` Python library, iterate to fix validation errors, and write an executive summary documenting what was extracted, inferred, and what gaps remain.

---

## REQUIRED OUTPUT FILES (MANDATORY)

**You MUST write all of the following files to `{{results_dir}}`.
The task is NOT complete until every file exists and is non-empty. No exceptions.**

| File | Description |
|------|-------------|
| `{{results_dir}}/croissant.json` | The generated Croissant JSON-LD metadata file |
| `{{results_dir}}/summary.md` | Executive summary with extraction details, validation results, and recommendations |
| `{{results_dir}}/validation_report.json` | Structured validation results with stages, results, and overall_passed |
| `{{results_dir}}/report.html` | Self-contained **single-file** HTML report (see Step 8) |

If you finish your analysis but have not written all files, go back and write them before stopping.

**Single-file HTML constraint (MANDATORY).** `report.html` MUST be ONE standalone `.html` file.
- All CSS MUST live inside `<style>` tags in the same file.
- All JavaScript MUST live inside `<script>` tags in the same file.
- No `<link rel="stylesheet">`, no `<script src="...">`, no `@import`, no sibling `.css`/`.js` files.
- No CDN imports and no network fetches at render time — the file must render offline.
- Images/fonts, if any, MUST be embedded as `data:` URIs or inline SVG.
- Do NOT write `report.css`, `report.js`, `styles.css`, `app.js`, or any other asset file alongside it.

---

## Parameters

| Parameter | Template Variable | Default | Description |
|-----------|------------------|---------|-------------|
| Results directory | `{{results_dir}}` | `/app/results` (Jetty) / `./results` (local) | Output directory for all results |
| PDF filename | `{{pdf_filename}}` | — | The uploaded PDF file (available at `/app/uploads/{{pdf_filename}}`) |
| HuggingFace URL | `{{huggingface_url}}` | (empty) | Optional HuggingFace dataset URL for cross-referencing |
| Dataset name | `{{dataset_name}}` | (empty) | Optional dataset name override |

---

## Dependencies

| Dependency | Type | Required | Description |
|------------|------|----------|-------------|
| mlcroissant | Python package | Yes | Validates Croissant JSON-LD against the MLCommons schema |

---

## Step 1: Environment Setup

```bash
# Install the mlcroissant validator
pip install mlcroissant

# Create output directories
mkdir -p {{results_dir}}

# Verify the PDF exists
ls -la /app/uploads/{{pdf_filename}}
```

Verify all required inputs are available before proceeding.

---

## Step 2: Read and Analyze the Paper

Read the PDF thoroughly. Extract the following information where available:

### Dataset Identity
- **Name** — official dataset name (e.g., "SQuAD 2.0", "GSM8K")
- **Description** — 2-4 sentence summary of what the dataset is and its purpose
- **URL** — official website or repository URL
- **License** — distribution license (e.g., MIT, CC-BY-4.0, Apache-2.0)
- **Citation** — BibTeX or citation string
- **Version** — dataset version if mentioned
- **Date published** — publication date

### Creators
- **Authors** — names and affiliations
- **Organization** — hosting organization (e.g., "Stanford NLP", "OpenAI")

### Data Structure
- **Splits** — train/validation/test splits and their sizes
- **Features/fields** — column names, data types, descriptions
- **File format** — CSV, JSON, Parquet, etc.
- **Record sets** — distinct subsets or configurations (e.g., GSM8K has "main" and "socratic")

### Data Characteristics
- **Size** — number of examples, file sizes
- **Language** — natural language(s) present
- **Domain** — task domain (NLP, vision, math, etc.)
- **Task type** — classification, QA, summarization, generation, etc.
- **Collection method** — crowdsourced, scraped, synthetic, etc.

### Responsible AI (RAI) Metadata
- **Data collection method** — how the data was gathered (surveys, web scraping, crowdsourcing, experiments, etc.)
- **Collection timeframe** — when data was collected (start/end dates)
- **Missing data** — known gaps or missing values in the dataset
- **Raw data sources** — original data sources before processing
- **Preprocessing** — steps taken to clean or prepare the data
- **Imputation** — how missing or incomplete values were handled
- **Data manipulation** — transformations applied during curation (filtering, augmentation, etc.)
- **Annotation protocol** — how labels/annotations were created (workforce type, guidelines, task design)
- **Annotation platform** — tools or platforms used for annotation (e.g., Amazon Mechanical Turk, Label Studio)
- **Annotation analysis** — inter-annotator agreement, quality metrics, disagreement analysis
- **Annotations per item** — how many annotators labeled each example
- **Annotator demographics** — demographic information about the annotation workforce
- **Machine annotation tools** — automated tools used for labeling (NER, concept extraction, etc.)
- **Biases** — documented or acknowledged biases in the data
- **Limitations** — known generalization limits, non-recommended uses
- **Social impact** — discussion of potential societal implications
- **Personal/sensitive information** — whether the data contains PII or sensitive attributes (gender, age, geography, socioeconomic status, etc.)
- **Use cases** — intended applications (training, testing, fine-tuning, etc.)
- **Maintenance plan** — versioning, update frequency, deprecation policies

### Additional Metadata
- **Keywords/tags** — relevant tags for discovery
- **Related papers** — arXiv IDs referenced
- **Benchmarks** — leaderboard URLs or benchmark affiliations

**Important**: Distinguish between what is explicitly stated in the paper vs. what you are inferring. Track this distinction — you will report it in the summary.

---

## Step 3: Cross-Reference (if HuggingFace URL provided)

If `{{huggingface_url}}` is non-empty, use it as a supplementary source:

```bash
# If the URL points to a HuggingFace dataset, you can fetch its metadata:
# curl -sL "https://huggingface.co/api/datasets/{owner}/{name}" to get dataset info
# This can help fill in gaps about splits, features, file formats, etc.
```

Do NOT blindly copy from HuggingFace. The paper is the primary source. Use HuggingFace only to:
- Confirm split names and sizes
- Identify file formats (Parquet, CSV, etc.)
- Fill in missing license information
- Get the canonical dataset URL

---

## Step 4: Build the Croissant JSON-LD

Construct the Croissant file following the MLCommons Croissant 1.0 specification.

### Required Structure

```json
{
  "@context": {
    "@language": "en",
    "@vocab": "https://schema.org/",
    "citeAs": "cr:citeAs",
    "column": "cr:column",
    "conformsTo": "dct:conformsTo",
    "cr": "http://mlcommons.org/croissant/",
    "data": { "@id": "cr:data", "@type": "@json" },
    "dataType": { "@id": "cr:dataType", "@type": "@vocab" },
    "dct": "http://purl.org/dc/terms/",
    "extract": "cr:extract",
    "field": "cr:field",
    "fileProperty": "cr:fileProperty",
    "fileObject": "cr:fileObject",
    "fileSet": "cr:fileSet",
    "format": "cr:format",
    "includes": "cr:includes",
    "isLiveDataset": "cr:isLiveDataset",
    "jsonPath": "cr:jsonPath",
    "key": "cr:key",
    "md5": "cr:md5",
    "parentField": "cr:parentField",
    "path": "cr:path",
    "rai": "http://mlcommons.org/croissant/RAI/",
    "recordSet": "cr:recordSet",
    "references": "cr:references",
    "regex": "cr:regex",
    "repeated": "cr:repeated",
    "replace": "cr:replace",
    "sc": "https://schema.org/",
    "separator": "cr:separator",
    "source": "cr:source",
    "subField": "cr:subField",
    "transform": "cr:transform"
  },
  "@type": "sc:Dataset",
  "conformsTo": "http://mlcommons.org/croissant/1.0",
  "name": "...",
  "description": "...",
  "url": "...",
  "license": "...",
  "creator": { ... },
  "keywords": [ ... ],
  "distribution": [ ... ],
  "recordSet": [ ... ],

  "rai:dataCollection": "...",
  "rai:dataCollectionType": [ ... ],
  "rai:dataCollectionTimeframe": [ ... ],
  "rai:dataCollectionMissingData": "...",
  "rai:dataCollectionRawData": "...",
  "rai:dataPreprocessingProtocol": [ ... ],
  "rai:dataImputationProtocol": "...",
  "rai:dataManipulationProtocol": "...",
  "rai:dataAnnotationProtocol": "...",
  "rai:dataAnnotationPlatform": [ ... ],
  "rai:dataAnnotationAnalysis": [ ... ],
  "rai:annotationsPerItem": "...",
  "rai:annotatorDemographics": [ ... ],
  "rai:machineAnnotationTools": [ ... ],
  "rai:dataBiases": [ ... ],
  "rai:dataLimitations": [ ... ],
  "rai:dataSocialImpact": "...",
  "rai:personalSensitiveInformation": [ ... ],
  "rai:dataUseCases": [ ... ],
  "rai:dataReleaseMaintenancePlan": [ ... ]
}
```

### Field Mapping Rules

| Paper Information | Croissant Field | Type |
|-------------------|----------------|------|
| Dataset name | `name` | `sc:Text` |
| Description | `description` | `sc:Text` |
| Official URL | `url` | `sc:URL` |
| Alt names / abbreviations | `alternateName` | `sc:Text[]` |
| License | `license` | `sc:URL` (use choosealicense.com URLs) |
| Citation | `citeAs` | `sc:Text` |
| Authors | `creator` | `sc:Person` or `sc:Organization` |
| Tags | `keywords` | `sc:Text[]` |
| Related URL | `sameAs` | `sc:URL` |

### RAI Field Mapping Rules

Include all RAI fields where the paper provides relevant information. Omit fields where the paper says nothing — do not fabricate RAI metadata.

| Paper Information | Croissant RAI Field | Type | Cardinality |
|-------------------|---------------------|------|-------------|
| Data collection method description | `rai:dataCollection` | `sc:Text` | ONE |
| Collection method category | `rai:dataCollectionType` | `sc:Text` | MANY |
| Collection date range | `rai:dataCollectionTimeframe` | `sc:DateTime` | MANY |
| Known gaps / missing data | `rai:dataCollectionMissingData` | `sc:Text` | ONE |
| Original data sources | `rai:dataCollectionRawData` | `sc:Text` | ONE |
| Preprocessing / cleaning steps | `rai:dataPreprocessingProtocol` | `sc:Text` | MANY |
| Missing value handling | `rai:dataImputationProtocol` | `sc:Text` | ONE |
| Filtering, augmentation, transforms | `rai:dataManipulationProtocol` | `sc:Text` | ONE |
| Annotation methodology | `rai:dataAnnotationProtocol` | `sc:Text` | ONE |
| Annotation tools / platforms | `rai:dataAnnotationPlatform` | `sc:Text` | MANY |
| Inter-annotator agreement, quality | `rai:dataAnnotationAnalysis` | `sc:Text` | MANY |
| Labels per example | `rai:annotationsPerItem` | `sc:Text` | ONE |
| Annotator demographics | `rai:annotatorDemographics` | `sc:Text` | MANY |
| Automated labeling tools | `rai:machineAnnotationTools` | `sc:Text` | MANY |
| Documented biases | `rai:dataBiases` | `sc:Text` | MANY |
| Known limitations | `rai:dataLimitations` | `sc:Text` | MANY |
| Social impact discussion | `rai:dataSocialImpact` | `sc:Text` | ONE |
| PII / sensitive attributes | `rai:personalSensitiveInformation` | `sc:Text` | MANY |
| Intended use cases | `rai:dataUseCases` | `sc:Text` | MANY |
| Versioning / maintenance plan | `rai:dataReleaseMaintenancePlan` | `sc:Text` | MANY |

**Cardinality**: ONE = single string value. MANY = array of strings.

**Allowed values for `rai:dataCollectionType`**: Surveys, Secondary Data Analysis, Physical Collection, Direct Measurement, Document Analysis, Manual Curation, Software Collection, Experiments, Web Scraping, Web API, Focus Groups, Self-reporting, Customer Feedback, User-generated Content, Passive Collection, Others.

**Allowed values for `rai:personalSensitiveInformation`**: Gender, Socio-economic Status, Geography, Language, Age, Culture, Experience, Others.

**Allowed values for `rai:dataUseCases`**: Training, Testing, Validation, Development, Production, Fine-tuning, Usage Guidelines.

### Distribution (Data Sources)

For each data source described in the paper, add a `cr:FileObject` or `cr:FileSet`:

```json
{
  "@type": "cr:FileObject",
  "@id": "repo",
  "name": "repo",
  "description": "The dataset repository.",
  "contentUrl": "https://...",
  "encodingFormat": "git+https"
}
```

If the exact hosting URL is unknown, use the most likely canonical URL based on the paper (e.g., the project website, GitHub repo, or HuggingFace URL).

### Record Sets

For each data split/configuration, define:

1. A **splits RecordSet** (type `cr:Split`) listing the split names
2. A **data RecordSet** with fields matching the dataset's columns

Each field needs:
- `@type`: `cr:Field`
- `@id`: unique identifier (format: `{recordset_name}/{field_name}`)
- `dataType`: one of `sc:Text`, `sc:Integer`, `sc:Float`, `sc:Boolean`, `sc:URL`, `cr:Int32`
- `source`: reference to the FileSet and column extraction

### Data Type Mapping

| Paper Description | Croissant `dataType` |
|-------------------|---------------------|
| Text, string, sentence | `sc:Text` |
| Integer, count, index | `sc:Integer` |
| Float, score, probability | `sc:Float` |
| Boolean, binary | `sc:Boolean` |
| Label (categorical integer) | `sc:Integer` (add label descriptions in `description`) |
| Nested/structured | Use `subField` for nested objects |
| List/array | Set `isArray: true` with `arrayShape: "-1"` |

---

## Step 5: Evaluate Outputs

Write the JSON to `{{results_dir}}/croissant.json`, then validate:

```python
#!/usr/bin/env python3
import json
import mlcroissant as mlc

# Stage 1: JSON validity
with open("{{results_dir}}/croissant.json") as f:
    data = json.load(f)
print("JSON is valid")

# Stage 2: Croissant schema validation
try:
    dataset = mlc.Dataset(jsonld=data)
    print("Croissant schema validation passed")
except mlc.ValidationError as e:
    print(f"Croissant validation failed: {e}")
    # FIX THE ERRORS — see Step 6

# Stage 3: Record set inspection (informational)
try:
    for rs in dataset.metadata.record_sets:
        print(f"  Record set: {rs.uuid}")
except Exception as e:
    print(f"  Record set inspection note: {e}")
```

For each validation stage, assign an evaluation status:

| Status | Criteria |
|--------|----------|
| `PASS` | JSON is valid, Croissant schema validates without errors, record sets are inspectable |
| `PARTIAL` | JSON is valid and schema validates but record set inspection has warnings |
| `FAIL` | JSON is invalid or Croissant schema validation fails |

---

## Step 6: Iterate on Errors (max 3 rounds)

If any validation stage received `FAIL` or `PARTIAL` status:

1. Read the specific error message or failure reason
2. Apply the targeted fix from the Common Fixes table below
3. Re-run the failed item through Step 4
4. Re-evaluate with Step 5 criteria
5. Repeat up to 3 times total

After 3 rounds, keep the best result and flag remaining failures in the summary.

### Common Fixes

| Issue | Fix |
|-------|-----|
| `Missing @context` | Ensure the full `@context` block is present |
| `Unknown field` | Check field name spelling against the Croissant vocabulary |
| `Missing required property` | Add the missing property (often `name`, `@id`, or `dataType`) |
| `Invalid @id reference` | Ensure `@id` values are unique and cross-references use `{"@id": "..."}` |
| `Invalid dataType` | Use only Croissant-recognized types (`sc:Text`, `sc:Integer`, etc.) |
| `FileSet without containedIn` | Add `"containedIn": {"@id": "parent_file_object_id"}` |
| `Field without source` | Each non-split field needs a `source` with `fileSet` and `extract` |

---

## Step 7: Write Executive Summary

Write `{{results_dir}}/summary.md` with the following structure:

```markdown
# Croissant Metadata Report: {Dataset Name}

## Overview
- **Date**: {run date}
- **Paper**: {paper title}
- **PDF**: {{pdf_filename}}
- **HuggingFace**: {{huggingface_url}} (if provided)

## Results Summary

### Fields Populated from Paper (high confidence)
| Field | Value | Source |
|-------|-------|--------|
| name | ... | Paper section 1 |
| description | ... | Paper abstract |
| ... | ... | ... |

### Fields Inferred or Approximated (medium confidence)
| Field | Value | Rationale |
|-------|-------|-----------|
| ... | ... | ... |

### Fields Not Populated (gaps)
| Field | Reason |
|-------|--------|
| ... | Not mentioned in paper |

## Validation Results
- **JSON**: PASS/FAIL
- **Croissant Schema**: PASS/FAIL
- **Record Sets**: PASS/FAIL ({N} found)
- **Iterations Required**: {N}
- **Remaining Errors**: {description or "None"}

## Data Structure
- **Splits**: {list splits with sizes if known}
- **Fields**: {list fields with types}
- **Record Sets**: {count and names}

## Responsible AI (RAI) Fields

### RAI Fields Populated
| RAI Field | Value Summary | Source |
|-----------|--------------|--------|
| rai:dataCollection | ... | Paper section N |
| ... | ... | ... |

### RAI Fields Not Populated
| RAI Field | Reason |
|-----------|--------|
| ... | Not discussed in paper |

## Recommendations
- {What could not be determined from the paper alone}
- {Suggestions for improving the metadata with access to the actual data files}
- {Notes about fields that may need manual review}

## Limitations
- {Caveats about extraction quality}
- {Fields that may need manual verification}
```

---

## Step 8: Write the Single-File HTML Report

Write `{{results_dir}}/report.html` — a **single, self-contained** HTML file summarizing the extraction.

### Hard requirements (non-negotiable)

1. Exactly ONE file: `{{results_dir}}/report.html`. No sibling `.css` or `.js` files.
2. All styles inline in `<style>` tags. No `<link rel="stylesheet">`, no `@import`, no external stylesheets.
3. All scripts inline in `<script>` tags. No `<script src="...">`, no module imports from URLs, no `import` / `require` from the network.
4. No CDN references (Tailwind play CDN, Google Fonts, jsDelivr, unpkg, highlight.js CDN, etc.). The page MUST render identically with the network disabled.
5. Any image or font assets MUST be embedded as `data:` URIs or inline SVG. No remote `<img src="https://...">`.
6. The file MUST start with `<!DOCTYPE html>` and be valid HTML5.

### Required content

The report should include these sections (use semantic HTML — `<header>`, `<main>`, `<section>`):

- **Header** — dataset name, paper title, run date.
- **Validation badge** — a colored pill showing overall pass/partial/fail, pulled from `validation_report.json`'s `overall_passed`.
- **Overview** — description, URL, license, citation.
- **Data structure** — splits (with sizes if known), record sets, fields with types.
- **RAI summary** — which RAI fields were populated vs skipped, with the populated values.
- **Fields table** — "Populated from paper", "Inferred", "Not populated" (mirror the summary.md tables).
- **Copy-to-clipboard action** — a button that, when clicked, copies the full Croissant JSON to the clipboard. Embed the JSON as a `<script type="application/json" id="croissant-data">...</script>` block and read it from a short inline `<script>` handler. Do NOT `fetch()` the JSON file.
- **Footer** — "Generated by pdf2croissant" link to the dataset URL (if known).

### Style guidance

- System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) — do NOT load Google Fonts.
- A single `<style>` block at the top of `<head>`. CSS variables for a small color palette are fine.
- Responsive with a simple max-width container (~900px).
- Light theme is fine; dark-mode via `prefers-color-scheme` is optional.

### Verification (run after writing)

```bash
REPORT="{{results_dir}}/report.html"

# Must exist and be non-empty
test -s "$REPORT" && echo "PASS: report.html exists" || { echo "FAIL: report.html missing/empty"; exit 1; }

# No external stylesheets or scripts
if grep -Eqi '<link[^>]+rel=["'"'"']?stylesheet' "$REPORT"; then echo "FAIL: external <link rel=stylesheet> found"; exit 1; fi
if grep -Eqi '<script[^>]+\bsrc=' "$REPORT"; then echo "FAIL: external <script src> found"; exit 1; fi
if grep -Eqi '@import[[:space:]]+url' "$REPORT"; then echo "FAIL: CSS @import found"; exit 1; fi

# No CDN / network hosts in href/src
if grep -Eqi '(href|src)=["'"'"']https?://' "$REPORT"; then echo "FAIL: remote href/src found"; exit 1; fi

# No stray .css / .js siblings in results_dir
EXTRAS=$(find "{{results_dir}}" -maxdepth 1 -type f \( -name "*.css" -o -name "*.js" \) 2>/dev/null)
if [ -n "$EXTRAS" ]; then echo "FAIL: found sibling asset files:"; echo "$EXTRAS"; exit 1; fi

echo "PASS: report.html is single-file and self-contained"
```

If any check fails, fix `report.html` and re-run verification. Do NOT move on until every check passes.

---

## Step 9: Write Validation Report

Write `{{results_dir}}/validation_report.json`:

```json
{
  "version": "1.0.0",
  "run_date": "2026-01-01T00:00:00Z",
  "parameters": {
    "pdf_filename": "{{pdf_filename}}",
    "huggingface_url": "{{huggingface_url}}",
    "dataset_name": "{{dataset_name}}"
  },
  "stages": [
    { "name": "setup", "passed": true, "message": "Environment ready" },
    { "name": "paper_analysis", "passed": true, "message": "Paper read and metadata extracted" },
    { "name": "croissant_generation", "passed": true, "message": "Croissant JSON-LD generated" },
    { "name": "json_validity", "passed": true, "message": "Valid JSON" },
    { "name": "croissant_schema", "passed": true, "message": "Schema validation passed" },
    { "name": "record_sets", "passed": true, "message": "N record sets found" },
    { "name": "report_generation", "passed": true, "message": "All output files written" }
  ],
  "results": {
    "pass": 0,
    "partial": 0,
    "fail": 0
  },
  "overall_passed": true,
  "iterations": 1,
  "output_files": [
    "{{results_dir}}/croissant.json",
    "{{results_dir}}/summary.md",
    "{{results_dir}}/validation_report.json",
    "{{results_dir}}/report.html"
  ]
}
```

Add a `report_html` stage entry to the `stages` array above, set to `true` only if `report.html` exists, is non-empty, and passes the single-file verification from Step 8.

---

## Step 10: Final Checklist (MANDATORY — do not skip)

### Verification Script

```bash
echo "=== FINAL OUTPUT VERIFICATION ==="
RESULTS_DIR="{{results_dir}}"
for f in "$RESULTS_DIR/croissant.json" "$RESULTS_DIR/summary.md" "$RESULTS_DIR/validation_report.json" "$RESULTS_DIR/report.html"; do
  if [ ! -s "$f" ]; then
    echo "FAIL: $f is missing or empty"
  else
    echo "PASS: $f ($(wc -c < "$f") bytes)"
  fi
done

# Verify JSON files parse correctly
python3 -c "import json; json.load(open(\"$RESULTS_DIR/croissant.json\"))" && echo "PASS: croissant.json is valid JSON" || echo "FAIL: croissant.json is not valid JSON"
python3 -c "import json; d=json.load(open(\"$RESULTS_DIR/validation_report.json\")); assert \"overall_passed\" in d" && echo "PASS: validation_report.json has overall_passed" || echo "FAIL: validation_report.json missing overall_passed"

# Verify report.html single-file constraint
REPORT="$RESULTS_DIR/report.html"
grep -qi '^<!DOCTYPE html>' "$REPORT" && echo "PASS: report.html has DOCTYPE" || echo "FAIL: report.html missing <!DOCTYPE html>"
if grep -Eqi '<link[^>]+rel=["'"'"']?stylesheet' "$REPORT"; then echo "FAIL: report.html has external stylesheet"; else echo "PASS: report.html has no external stylesheet"; fi
if grep -Eqi '<script[^>]+\bsrc=' "$REPORT"; then echo "FAIL: report.html has external script"; else echo "PASS: report.html has no external script"; fi
if grep -Eqi '(href|src)=["'"'"']https?://' "$REPORT"; then echo "FAIL: report.html has remote href/src"; else echo "PASS: report.html has no remote href/src"; fi
EXTRAS=$(find "$RESULTS_DIR" -maxdepth 1 -type f \( -name "*.css" -o -name "*.js" \) 2>/dev/null)
if [ -n "$EXTRAS" ]; then echo "FAIL: sibling asset files present: $EXTRAS"; else echo "PASS: no sibling .css/.js files"; fi
```

### Checklist

- [ ] `croissant.json` exists, is non-empty, and contains valid JSON-LD with at least `@context`, `@type`, `conformsTo`, `name`, `description`, and at least one `rai:` field
- [ ] `validation_report.json` exists, is non-empty, and contains a JSON object with `stages` array and `overall_passed` boolean
- [ ] `summary.md` exists, is non-empty, and follows the executive summary template from Step 7
- [ ] `report.html` exists, is non-empty, starts with `<!DOCTYPE html>`, and contains the sections listed in Step 8
- [ ] `report.html` has NO `<link rel="stylesheet">`, NO `<script src="...">`, NO `@import`, and NO `href`/`src` pointing to `http(s)://`
- [ ] No sibling `.css` or `.js` files exist in `{{results_dir}}`
- [ ] Verification script printed PASS for every check

**If ANY item fails, go back and fix it. Do NOT finish until all items pass.**

---

## Tips

- **The paper is the primary source of truth.** Do not hallucinate metadata that isn't in the paper. If something is unclear, leave it out and document the gap.
- **Use the full @context block.** Missing context entries are a common validation failure. Copy the complete context from the template in Step 4.
- **@id values must be unique.** Use the pattern `{recordset}/{field}` for fields and `{config}_splits` for split record sets.
- **License URLs**: Use `https://choosealicense.com/licenses/{spdx-id}/` format (e.g., `https://choosealicense.com/licenses/mit/`).
- **Keywords**: Include task type, language, size range, format, and any arXiv IDs (e.g., `"arxiv:2110.14168"`).
- **Multiple configurations**: If the dataset has multiple subsets (like GLUE's tasks or GSM8K's main/socratic), create separate FileSet + RecordSet pairs for each.
- **Nested fields**: Use `subField` for structured data (e.g., SQuAD's answers field containing text + answer_start arrays).
- **Pretty-print the JSON**: Use 2-space indentation in the final `croissant.json` for readability.
- **RAI fields**: Always include the `rai:` namespace in `@context`. Populate every RAI field the paper supports — most papers discuss at least collection method, biases, and limitations. Use controlled vocabulary values for `dataCollectionType`, `personalSensitiveInformation`, and `dataUseCases` where applicable. Fields with cardinality MANY take an array even if there is only one value.
