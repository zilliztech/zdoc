---
title: "delete | Cloud"
slug: /cli/cli/PrivateLink-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除一个 PrivateLink 端点。 | Cloud"
type: docx
token: JYr4dveljoLs84xSAXJclFSkn8d
sidebar_position: 3
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
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

此操作用于删除一个 PrivateLink 端点。

## 用法\{#usage}

```bash
zilliz privatelink delete [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    **[必填]**

    项目 ID。

- **--endpoint-id** (*string*) -

    **[必填]**

    要删除的端点 ID。

## 示例\{#example}

```bash
zilliz privatelink delete --project-id proj-xxxx --endpoint-id vpce-xxxx
```
