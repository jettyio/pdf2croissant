# PDF → Croissant — Agent Runbook

## Objective

You are given an academic paper (PDF) that introduces or describes a machine learning dataset. Your job is to:

1. Read and deeply understand the paper
2. Extract all dataset metadata described in the paper
3. Produce a valid MLCommons Croissant JSON-LD file
4. Validate the file using the `mlcroissant` Python library
5. Iterate to fix any validation errors (up to 3 rounds)
6. Write an executive summary documenting what was extracted, inferred, and what gaps remain

---

## REQUIRED OUTPUT FILES (MANDATORY)

**You MUST write all three of the following files to `/app/results/`. The task is NOT complete until every file exists and is non-empty. No exceptions.**

| File | Description |
|------|-------------|
| `/app/results/croissant.json` | The generated Croissant JSON-LD metadata file |
| `/app/results/summary.md` | Executive summary (markdown) |
| `/app/results/validation_report.json` | Structured validation results |

If you finish your analysis but have not written all three files, go back and write them before stopping.

---

## Parameters

- `{{pdf_filename}}` — The uploaded PDF file (available at `/app/uploads/{{pdf_filename}}`)
- `{{huggingface_url}}` — Optional HuggingFace dataset URL for cross-referencing (may be empty)
- `{{dataset_name}}` — Optional dataset name override (may be empty)

---

## Step 1: Environment Setup

```bash
# Install the mlcroissant validator
pip install mlcroissant

# Create output directories
mkdir -p /app/results

# Verify the PDF exists
ls -la /app/uploads/{{pdf_filename}}
```

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
    "dataBiases": "cr:dataBiases",
    "dataCollection": "cr:dataCollection",
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
    "personalSensitiveInformation": "cr:personalSensitiveInformation",
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
  "recordSet": [ ... ]
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

## Step 5: Validate

Write the JSON to `/app/results/croissant.json`, then validate:

```python
#!/usr/bin/env python3
import json
import mlcroissant as mlc

# Stage 1: JSON validity
with open("/app/results/croissant.json") as f:
    data = json.load(f)
print("✓ JSON is valid")

# Stage 2: Croissant schema validation
try:
    dataset = mlc.Dataset(jsonld=data)
    print("✓ Croissant schema validation passed")
except mlc.ValidationError as e:
    print(f"✗ Croissant validation failed: {e}")
    # FIX THE ERRORS — see Step 6

# Stage 3: Record set inspection (informational)
try:
    for rs in dataset.metadata.record_sets:
        print(f"  Record set: {rs.uuid}")
except Exception as e:
    print(f"  Record set inspection note: {e}")
```

Save structured results to `/app/results/validation_report.json`:

```json
{
  "stages": [
    { "name": "json_validity", "passed": true, "message": "Valid JSON" },
    { "name": "croissant_schema", "passed": true, "message": "Schema validation passed" },
    { "name": "record_sets", "passed": true, "message": "3 record sets found" }
  ],
  "overall_passed": true,
  "iterations": 1
}
```

---

## Step 6: Iterate on Errors (up to 3 rounds)

If validation fails, read the error message carefully and fix the issue. Common problems:

| Error Pattern | Fix |
|--------------|-----|
| `Missing @context` | Ensure the full `@context` block is present |
| `Unknown field` | Check field name spelling against the Croissant vocabulary |
| `Missing required property` | Add the missing property (often `name`, `@id`, or `dataType`) |
| `Invalid @id reference` | Ensure `@id` values are unique and cross-references use `{"@id": "..."}` |
| `Invalid dataType` | Use only Croissant-recognized types (`sc:Text`, `sc:Integer`, etc.) |
| `FileSet without containedIn` | Add `"containedIn": {"@id": "parent_file_object_id"}` |
| `Field without source` | Each non-split field needs a `source` with `fileSet` and `extract` |

After each fix:
1. Overwrite `/app/results/croissant.json`
2. Re-run the validation script
3. Update `/app/results/validation_report.json` with the new iteration count

Stop after 3 iterations even if errors remain — document remaining issues in the summary.

---

## Step 7: Write Executive Summary

Write `/app/results/summary.md` with the following structure:

```markdown
# Croissant Metadata Report: {Dataset Name}

## Source
- **Paper**: {paper title}
- **PDF**: {{pdf_filename}}
- **HuggingFace**: {{huggingface_url}} (if provided)

## Extraction Summary

### Fields Populated from Paper (high confidence)
| Field | Value | Source |
|-------|-------|--------|
| name | ... | Paper §1 |
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
- **JSON**: ✓/✗
- **Croissant Schema**: ✓/✗
- **Record Sets**: ✓/✗ ({N} found)
- **Iterations Required**: {N}
- **Remaining Errors**: {description or "None"}

## Data Structure
- **Splits**: {list splits with sizes if known}
- **Fields**: {list fields with types}
- **Record Sets**: {count and names}

## Limitations & Recommendations
- {Bullet points about what could not be determined from the paper alone}
- {Suggestions for improving the metadata with access to the actual data files}
- {Notes about fields that may need manual review}
```

---

## Step 8: Final Checklist (MANDATORY — do not skip)

You MUST complete every item on this checklist before finishing. Run the verification script, then confirm each item.

### Verification script

```bash
# Run this BEFORE declaring the task complete
echo "=== FINAL OUTPUT VERIFICATION ==="
for f in /app/results/croissant.json /app/results/summary.md /app/results/validation_report.json; do
  if [ ! -s "$f" ]; then
    echo "FAIL: $f is missing or empty"
  else
    echo "PASS: $f ($(wc -c < "$f") bytes)"
  fi
done
```

### Checklist

- [ ] `/app/results/croissant.json` exists, is non-empty, and contains valid JSON-LD with at least `@context`, `@type`, `conformsTo`, `name`, and `description`
- [ ] `/app/results/validation_report.json` exists, is non-empty, and contains a JSON object with `stages` array and `overall_passed` boolean
- [ ] `/app/results/summary.md` exists, is non-empty, and follows the executive summary template from Step 7
- [ ] The verification script above printed PASS for all three files

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
