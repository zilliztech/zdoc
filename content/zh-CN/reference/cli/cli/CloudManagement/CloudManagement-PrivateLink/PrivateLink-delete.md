---
title: "delete | Cloud"
slug: /cli/cli/PrivateLink-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个 PrivateLink Endpoint。 | Cloud"
type: docx
token: JYr4dveljoLs84xSAXJclFSkn8d
sidebar_position: 3
keywords: 
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - 异常检测
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

此操作会删除一个 PrivateLink Endpoint。

## 用法\{#usage}

```bash
zilliz privatelink delete [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    **[必需]**

    项目 ID。

- **--endpoint-id** (*string*) -

    **[必需]**

    要删除的 Endpoint ID。

## 示例\{#example}

```bash
zilliz privatelink delete --project-id proj-xxxx --endpoint-id vpce-xxxx
```
