---
title: "export | Cloud"
slug: /cli/cli/Backup-export
sidebar_label: "export"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将备份导出到外部存储。 | Cloud"
type: docx
token: MqCqdE8mqotzaXxk8nfcOvHinX0
sidebar_position: 5
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - export
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# export

此操作将备份导出到外部存储。

## 描述\{#description}

在 Zilliz Cloud 中，备份是数据的副本，可在发生数据丢失或系统故障时用于恢复整个集群或特定集合。

您可以将备份文件导出到由集成 ID 标识的已集成存储服务中。此操作是异步的，并会创建一个作业。您可以运行 [`zilliz job describe`](./Job-describe) 获取该作业的进度。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 用法\{#usage}

```bash
zilliz backup export
--cluster-id <value>
--backup-id <value>
--integration-id <value>
[--directory <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

**选项：**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    指定集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未显式配置此选项时会自动应用该集群。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    指定备份 ID，格式类似于 `backupx-xxxxx`。

- **--integration-id** (*string*) -

    **[REQUIRED]**

    指定存储集成 ID，格式类似于 `integ-xxxxx`。

- **--directory** (*string*) -

    指定外部存储中的目标目录。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz backup export --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--integration-id integ-xxxx
```
