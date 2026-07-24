---
title: "describe | Cloud"
slug: /cli/cli/Project-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the details of a project. | Cloud"
type: docx
token: OBDNd4bW2oCJqhxEPDSccggSnif
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

This operation gets the details of a project.

## Synopsis\{#synopsis}

```bash
zilliz project describe
--project-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID, which is similar to `proj-xxxxx`.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz project describe --project-id proj-xxxxxxxxxxxx
```
