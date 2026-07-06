---
title: "delete | Cloud"
slug: /cli/cli/StorageIntegration-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a storage integration by ID. Use it when an external bucket credential should no longer be available to Zilliz Cloud. | Cloud"
type: docx
token: Is4sdUuC2odTHKxq9NKcl8dynfh
sidebar_position: 2
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

This operation deletes a storage integration by ID. Use it when an external bucket credential should no longer be available to Zilliz Cloud.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration delete --integration-id <string>
```

**OPTIONS:**

- **--integration-id** (*string*) -

    **[REQUIRED]**

    Specifies the storage integration ID.

## Example\{#example}

```bash
zilliz storage-integration delete --integration-id int-xxxxxxxx
```
