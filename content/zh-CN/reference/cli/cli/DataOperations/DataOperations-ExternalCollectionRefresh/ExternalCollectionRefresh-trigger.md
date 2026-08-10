---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为外部 Collection 触发一个刷新作业。返回作业 ID。 | Cloud"
type: docx
token: ApSLdblNKo7ru0xGTqbconxBnSh
sidebar_position: 3
keywords: 
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管式向量 Database
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

此操作会为外部 Collection 触发一个刷新作业。返回作业 ID。

## 描述\{#description}

在当前集群上下文中为外部 Collection 启动一个刷新作业。使用返回的 `jobId`，通过 `zilliz external-collection refresh describe` 检查该作业。

## 概要\{#synopsis}

```bash
zilliz external-collection refresh trigger
--name <value>
[--database <value>]
[--external-source <value>]
[--external-spec <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必填]**

    指定外部 Collection 名称。

- **--database** (*string*) -

    指定 Database 名称。

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
