---
title: "describe-policy | Cloud"
slug: /cli/cli/Backup-describepolicy
sidebar_label: "describe-policy"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于描述集群的备份策略。 | Cloud"
type: docx
token: WcQadTMuCo9voCxPT86cxFzFnkf
sidebar_position: 4
keywords: 
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - describe-policy
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe-policy

此操作用于描述集群的备份策略。

## 说明\{#description}

Zilliz Cloud 允许您为集群启用**自动备份**，帮助确保在发生意外问题时能够恢复数据。自动备份适用于**整个集群**，不支持自动备份单个 Collection。

您可以运行此命令，了解适用于指定集群的当前自动备份策略的设置。

<Admonition type="info" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup describe-policy
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    指示集群 ID，类似于 `inxx-xxxxx`。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群。

- **--output, -o** (*string*) -

    指示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz backup describe-policy --cluster-id in01-xxxxxxxxxxxx
```
