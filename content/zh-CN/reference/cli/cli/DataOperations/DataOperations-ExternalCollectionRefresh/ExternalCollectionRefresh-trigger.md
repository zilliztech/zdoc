---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为外部集合触发一个刷新任务，并返回任务 ID。 | Cloud"
type: docx
token: ApSLdblNKo7ru0xGTqbconxBnSh
sidebar_position: 3
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - trigger
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# trigger

此操作会为外部集合触发一个刷新任务，并返回任务 ID。

## 描述\{#description}

在当前集群上下文中为外部集合启动一个刷新任务。使用返回的 `jobId`，可通过 `zilliz external-collection refresh describe` 查询该任务。

## 简介\{#synopsis}

```bash
zilliz external-collection refresh trigger
--name <value>
[--database <value>]
[--external-source <value>]
[--external-spec <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定外部集合名称。

- **--database** (*string*) -

    指定数据库名称。

- **--external-source** (*string*) -

    覆盖外部源（可选）。

- **--external-spec** (*string*) -

    覆盖外部规格（可选）。

## 示例\{#example}

```bash
# Trigger refresh for an external collection
zilliz external-collection refresh trigger --name my_external_coll

# Example output
# {
#   "jobId": 123456
# }

# Trigger refresh in a non-default database
zilliz external-collection refresh trigger --name my_external_coll --database my_db
```
