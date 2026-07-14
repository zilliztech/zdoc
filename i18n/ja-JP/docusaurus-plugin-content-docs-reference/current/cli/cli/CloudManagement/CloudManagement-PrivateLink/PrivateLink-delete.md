---
title: "delete | Cloud"
slug: /cli/cli/PrivateLink-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は PrivateLink エンドポイントを削除します。 | Cloud"
type: docx
token: JYr4dveljoLs84xSAXJclFSkn8d
sidebar_position: 3
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - 異常検知
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

この操作は PrivateLink エンドポイントを削除します。

## 使用方法\{#usage}

```bash
zilliz privatelink delete [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    プロジェクト ID。

- **--endpoint-id** (*string*) -

    **[REQUIRED]**

    削除するエンドポイント ID。

## 例\{#example}

```bash
zilliz privatelink delete --project-id proj-xxxx --endpoint-id vpce-xxxx
```
