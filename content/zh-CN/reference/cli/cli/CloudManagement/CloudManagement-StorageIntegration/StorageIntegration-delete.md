---
title: "delete | Cloud"
slug: /cli/cli/StorageIntegration-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按 ID 删除存储集成。当外部存储桶凭证不应再提供给 Zilliz Cloud 使用时，请使用此操作。 | Cloud"
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

此操作按 ID 删除存储集成。当外部存储桶凭证不应再提供给 Zilliz Cloud 使用时，请使用此操作。

## 简介\{#synopsis}

```bash
zilliz storage-integration delete --integration-id <string>
```

**选项：**

- **--integration-id** (*string*) -

    **[必需]**

    指定存储集成 ID。

## 示例\{#example}

```bash
zilliz storage-integration delete --integration-id int-xxxxxxxx
```
