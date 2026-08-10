---
title: "restore-cluster | Cloud"
slug: /cli/cli/Backup-restorecluster
sidebar_label: "restore-cluster"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作会将备份恢复到一个新集群。| Cloud"
type: docx
token: XAhudiqXqoHS1zxSDqgcNY9anxb
sidebar_position: 7
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 近邻算法
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

此操作会将备份恢复到一个新集群。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您数据的一个副本，可在数据丢失或系统故障时帮助您恢复整个集群或特定 Collection。

恢复集群会创建一个新集群，并将所有已备份的 Collection 复制到其中。运行此命令时如果不带任何选项，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="Notes">

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

    **[必需]**

    表示源集群 ID，类似于 `inxx-xxxxx`。

    如果集群使用 `zilliz context set` 进行了配置，则在未配置此选项时会自动应用。

- **--backup-id** (*string*) -

    **[必需]**

    表示要恢复的备份 ID，类似于 `backupx-xxxxx`。

- **--project-id** (*string*) -

    **[必需]**

    表示目标项目 ID，类似于 `proj-xxxxx`

- **--name** (*string*) -

    **[必需]**

    表示新集群名称。

- **--cu-size** (*integer*) -

    **[必需]**

    表示新集群的计算单元（CU）。

    CU 是用于并行处理数据的计算资源基本单位，不同类型的 CU 由不同组合的 CPU、内存和存储组成。CU 的概念仅适用于 **Dedicated** 集群。

    - 对于 **Standard** 项目中的 **Dedicated** 集群，其 CU 规格与副本数的乘积必须小于或等于 32。

    - 对于 **Enterprise** 项目中的 **Dedicated** 集群，其 CU 规格与副本数的乘积必须小于或等于 1,024。

- **--collection-status** (*string*) -

    **[必需]**

    表示恢复后的 Collection 状态。

    可能的值包括：`KEEP` 和 `RELEASE`。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--restore-version-policy** (*string*) -

    指定 DB 版本恢复策略。可能的值包括：`LATEST` 和 `ORIGINAL`。

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
