---
title: "delete | Cloud"
slug: /cli/cli/OnDemandCluster-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はオンデマンドクラスターを削除します。 | Cloud"
type: docx
token: HPKQd2dsfoBpcBx84yXc5IhenrM
sidebar_position: 2
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
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

この操作はオンデマンドクラスターを削除します。

## 使用方法\{#usage}

```bash
zilliz on-demand-cluster delete [OPTIONS]
```

**OPTIONS:**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    削除するオンデマンドクラスター ID。

## 例\{#example}

```bash
zilliz on-demand-cluster delete --cluster-id in-xxxxxxxxxxxx
```
