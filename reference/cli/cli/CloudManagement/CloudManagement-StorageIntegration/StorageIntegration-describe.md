---
title: "describe | Cloud"
slug: /cli/cli/StorageIntegration-describe
sidebar_key: cli/StorageIntegration-describe
sidebar_label: "describe"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation describes a storage integration by ID so you can inspect its current configuration, status, and validation message. | Cloud"
type: docx
token: Ia7VdhmCgoO6R3xcWtIck7Tfndf
sidebar_position: 3
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation describes a storage integration by ID so you can inspect its current configuration, status, and validation message.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration describe --integration-id <string>
```

**OPTIONS:**

- **--integration-id** (*string*) -

    **[REQUIRED]**

    Specifies the storage integration ID.

## Example\{#example}

```bash
zilliz storage-integration describe --integration-id int-xxxxxxxx
```
