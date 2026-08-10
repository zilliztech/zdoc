---
title: "delete | Cloud"
slug: /cli/cli/OnDemandCluster-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除按需集群。 | Cloud"
type: docx
token: HPKQd2dsfoBpcBx84yXc5IhenrM
sidebar_position: 2
keywords: 
  - 廉价向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
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

此操作会删除按需集群。

## 用法\{#usage}

```bash
zilliz on-demand-cluster delete [OPTIONS]
```

**选项：**

- **--cluster-id** (*string*) -

    **[必填]**

    要删除的按需集群 ID。

## 示例\{#example}

```bash
zilliz on-demand-cluster delete --cluster-id in-xxxxxxxxxxxx
```
