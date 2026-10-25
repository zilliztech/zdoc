---
title: "list | Cloud"
slug: /cli/cli/Backup-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有备份。 | Cloud"
type: docx
token: VHhWdygYaoyAmQxRpP6cvmIYndc
sidebar_position: 6
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有备份。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您数据的副本，可在发生数据丢失或系统故障时用于恢复整个集群或特定 Collection。

如果您在不带任何选项的情况下运行此命令，系统会询问您是否要设置其他选项。该提示默认为 yes，并会引导您完成选项设置。如果您在该提示中输入 N，此命令会检索所有备份。

<Admonition type="info" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup list
[--project-id <value>]
[--cluster-id <value>]
[--creation-method <manual | auto>]
[--backup-type <CLUSTER | COLLECTION>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## 选项\{#options}

- **--project-id** (*string*) -

    指示项目 ID 作为筛选条件，该值类似于 `proj-xxxxx`。

- **--cluster-id** (*string*) -

    指示集群 ID 作为筛选条件，该值类似于 `inxx-xxxxx`。

    如果使用 `zilliz context set` 配置了集群，则在此选项未配置时会自动应用该集群。

- **--creation-method** (*string*) -

    指示创建方式作为筛选条件。

    可能的值包括：`manual` 和 `auto`。

- **--backup-type** (*string*) -

    指示备份类型作为筛选条件。

    可能的值为 `CLUSTER` 和 `COLLECTION`。

- **--page-size** (*integer*) -

    指示每页条目数。该值默认为 **10**。

- **--page** (*integer*) -

    指示页码。该值默认为 **1**。

- **--output, -o** (*string*) -

    指示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

- **--all, -a** (*boolean*) -

    指示是否获取所有页面。

## 示例\{#example}

```bash
# List all backups
zilliz backup list

# List backups for a specific cluster
zilliz backup list --cluster-id in01-xxxxxxxxxxxx
```
