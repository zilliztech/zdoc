---
title: "list | Cloud"
slug: /cli/cli/StorageIntegration-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出外部存储集成，以便您在将其用于导入或外部集合工作流之前，查看集成 ID、名称、状态、区域、存储桶和服务器消息。 | Cloud"
type: docx
token: XScGdoVr8oYyWVxQzqKcy7eQnFG
sidebar_position: 5
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出外部存储集成，以便您在将其用于导入或外部集合工作流之前，查看集成 ID、名称、状态、区域、存储桶和服务器消息。

## 概要\{#synopsis}

```bash
zilliz storage-integration list [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    指定用于筛选存储集成的项目 ID。

- **--page-size** (*integer*) -

    指定每页返回的条目数。

- **--page** (*integer*) -

    指定要返回的页码。

## 示例\{#example}

```bash
zilliz storage-integration list

zilliz storage-integration list --project-id proj-xxxx
```
