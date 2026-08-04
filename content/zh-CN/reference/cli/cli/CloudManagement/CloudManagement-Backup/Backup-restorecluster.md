---
title: "restore-cluster | Cloud"
slug: /cli/cli/Backup-restorecluster
sidebar_label: "restore-cluster"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作会将备份恢复到一个新的集群。 | Cloud"
type: docx
token: XAhudiqXqoHS1zxSDqgcNY9anxb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - restore-cluster
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# restore-cluster

此操作会将备份恢复到一个新的集群。

## 描述\{#description}

在 Zilliz Cloud 中，备份是数据的副本，可在发生数据丢失或系统故障时帮助您恢复整个集群或特定 collection。

恢复集群会创建一个新的集群，并将所有已备份的 collection 复制到其中。在不带任何选项的情况下运行此命令，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup restore-cluster
--cluster-id <value>
--backup-id <value>
--project-id <value>
--name <value>
--cu-size <value>
--collection-status <KEEP | RELEASE>
--restore-version-policy <LATEST | ORIGINAL>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    指示源集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未设置此选项时会自动应用该配置。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    指示要恢复的备份 ID，格式类似于 `backupx-xxxxx`。

- **--project-id** (*string*) -

    **[REQUIRED]**

    指示目标项目 ID，格式类似于 `proj-xxxxx`

- **--name** (*string*) -

    **[REQUIRED]**

    指示新集群名称。

- **--cu-size** (*integer*) -

    **[REQUIRED]**

    指示新集群的计算单元（CU）数量。

    CU 是用于数据并行处理的计算资源基本单位，不同类型的 CU 由不同组合的 CPU、内存和存储构成。CU 的概念仅适用于 **Dedicated** 集群。

    - 对于 **Standard** 项目中的 **Dedicated** 集群，其 CU 数量与副本数的乘积必须小于或等于 32。

    - 对于 **Enterprise** 项目中的 **Dedicated** 集群，其 CU 数量与副本数的乘积必须小于或等于 1,024。

- **--collection-status** (*string*) -

    **[REQUIRED]**

    指示恢复后 collection 的状态。

    可选值：`KEEP` 和 `RELEASE`。

- **--output, -o** (*string*) -

    指示输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指示用于过滤输出的 JMESPath 表达式。

- **--restore-version-policy** (*string*) -

    指定 DB 版本恢复策略。可选值：`LATEST` 和 `ORIGINAL`。

## 示例\{#example}

```bash
# Restore with collections loaded
zilliz backup restore-cluster --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--project-id proj-xxxx \
--name restored \
--cu-size 1 \
--collection-status KEEP \
--restore-version-policy LATEST
```
