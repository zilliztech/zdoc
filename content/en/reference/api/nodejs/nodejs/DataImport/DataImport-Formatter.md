---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "This interface serializes buffered `BulkWriter` columns into one or more files. The SDK provides JSON and Parquet formatter implementations. | Node.js"
type: docx
token: CkuWdW6EXo8o9nxZsIrcBiSGn4d
sidebar_position: 14
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - Formatter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# Formatter

This interface serializes buffered `BulkWriter` columns into one or more files. The SDK provides JSON and Parquet formatter implementations.

```typescript
interface Formatter
```

**FIELDS:**

- **extension** (*string*) -

    **[REQUIRED]**

    Specifies the file extension produced by the formatter.

**METHODS:**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    Serializes buffered columns to files under `dir` and returns the generated local file paths.

## Example\{#example}

```javascript
class CustomFormatter {
    extension = '.json';
    async persist(columns, dynamicRows, rowCount, dir, schema) {
        return [];
    }
}
```
