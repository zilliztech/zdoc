---
title: "list | Cloud"
slug: /cli/cli/StorageIntegration-list
sidebar_key: cli/StorageIntegration-list
sidebar_label: "list"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists external storage integrations so you can review integration IDs, names, status, regions, buckets, and server messages before using them with import or external collection workflows. | Cloud"
type: docx
token: XScGdoVr8oYyWVxQzqKcy7eQnFG
sidebar_position: 5
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists external storage integrations so you can review integration IDs, names, status, regions, buckets, and server messages before using them with import or external collection workflows.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration list [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    Specifies the project ID used to filter storage integrations.

- **--page-size** (*integer*) -

    Specifies the number of items to return per page.

- **--page** (*integer*) -

    Specifies the page number to return.

## Example\{#example}

```bash
zilliz storage-integration list

zilliz storage-integration list --project-id proj-xxxx
```
