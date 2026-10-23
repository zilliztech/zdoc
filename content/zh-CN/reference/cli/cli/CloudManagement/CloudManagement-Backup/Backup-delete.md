---
title: "delete | Cloud"
slug: /cli/cli/Backup-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个备份。 | Cloud"
type: docx
token: F01Gdx5b8onjxOxbhficUecWndf
sidebar_position: 2
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw 算法
  - zilliz
  - zilliz cloud
  - 云
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

此操作会删除一个备份。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您数据的副本，使您能够在发生数据丢失或系统故障时恢复整个集群或特定 Collection。

如果不再需要某个备份，您可以将其删除。删除后的备份将立即不可用。请谨慎操作。

<Admonition type="info" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup delete 
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
[--yes]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    指示集群 ID，其格式类似于 `inxx-xxxx`。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群。

- **--backup-id** (*string*) -

    **[必需]**

    指示要删除的备份 ID，其格式类似于 `backupx-xxxxx`。

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

- **--yes, -y** (*boolean*) -

    指示是否跳过交互式提示。

## 示例\{#example}

```bash
zilliz backup delete \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
