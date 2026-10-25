---
title: "describe | Cloud"
slug: /cli/cli/Backup-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取备份的详细信息。 | Cloud"
type: docx
token: OQIRdZ8iOoZxd1xNPHtcWPTBnye
sidebar_position: 3
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw 算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - describe
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

此操作获取备份的详细信息。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您的数据副本，可用于在发生数据丢失或系统故障时恢复整个集群或特定 Collection。

您可以运行此命令获取备份的详细信息。

<Admonition type="info" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synposis}

```bash
zilliz backup describe
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    指示集群 ID，其格式类似于 `inxx-xxxxx`。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    指示备份 ID，其格式类似于 `backupx-xxxxx`。

- **--output, -o** (*string*) -

    指示输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时是否省略标题行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz backup describe \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
