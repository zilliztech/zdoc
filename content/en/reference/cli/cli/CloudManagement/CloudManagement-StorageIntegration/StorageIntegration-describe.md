---
title: "describe | Cloud"
slug: /cli/cli/StorageIntegration-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation describes a storage integration by ID so you can inspect its current configuration, status, and validation message. | Cloud"
type: docx
token: Ia7VdhmCgoO6R3xcWtIck7Tfndf
sidebar_position: 3
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
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
