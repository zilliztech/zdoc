---
title: "set | Cloud"
slug: /cli/cli/Context-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作用于选择后续数据平面命令使用的默认集群 Endpoint 和 Database。在运行 Collection、vector、index、Partition、user、role 或 alias 命令之前，请先设置上下文。 | Cloud"
type: docx
token: WF1JdhGAgodzpExXO1hcPjADn8b
sidebar_position: 3
keywords: 
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - 图像相似性搜索
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# set

此操作用于选择后续数据平面命令使用的默认集群 Endpoint 和 Database。在运行 Collection、vector、index、Partition、user、role 或 alias 命令之前，请先设置上下文。

## 说明\{#description}

设置后续数据平面命令使用的默认集群 Endpoint 和 Database。在运行 Collection、vector、index、Partition、user、role 或 alias 命令之前，请先设置上下文。

## 概要\{#synopsis}

```bash
zilliz context set
[--cluster-id <value>]
[--endpoint <value>]
[--database <value>]
[--on-demand]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    指定后续数据平面命令要使用的集群。如果您省略 --endpoint，CLI 会根据此集群 ID 解析集群 Endpoint。

- **--endpoint** (*string*) -

    直接指定集群 Endpoint。如果您已经知道该 Endpoint，或者不希望 CLI 根据集群 ID 解析它，请使用此选项。

- **--database** (*string*) -

    指定当前上下文中后续数据平面命令使用的默认 Database。此操作不会创建 Database。

- **--on-demand** (*boolean*) -

    解析按需集群的集群详细信息。当该集群 ID 属于按需集群时，请使用此选项。

## 示例\{#example}

```bash
# Set context to a standard cluster
zilliz context set --cluster-id in01-xxxxxxxxxxxx

# Set context to an on-demand cluster
zilliz context set --cluster-id in-xxxxxxxxxxxx --on-demand

# Update the database for the current context
zilliz context set --database my_db
```
