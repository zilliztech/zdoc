---
title: "导出 | Cloud"
slug: /cli/cli/Backup-export
sidebar_label: "导出"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将备份导出到外部存储。 | Cloud"
type: docx
token: MqCqdE8mqotzaXxk8nfcOvHinX0
sidebar_position: 5
keywords: 
  - 降维
  - hnsw 算法
  - 向量相似性搜索
  - 近似最近邻搜索
  - zilliz
  - zilliz cloud
  - cloud
  - 导出
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 导出

此操作会将备份导出到外部存储。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您数据的副本，可用于在发生数据丢失或系统故障时恢复整个集群或特定 Collection。

您可以将备份文件导出到通过其集成 ID 标识的集成存储服务。此操作为异步操作，并会创建一个作业。您可以运行 [`zilliz job describe`](./Job-describe) 以获取作业进度。

<Admonition type="info" icon="📘" title="Notes">

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

    **[必需]**

    表示集群 ID，类似于 `inxx-xxxxx`。

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时会自动应用该配置。

- **--backup-id** (*string*) -

    **[必需]**

    表示备份 ID，类似于 `backupx-xxxxx`。

- **--integration-id** (*string*) -

    **[必需]**

    表示存储集成 ID，类似于 `integ-xxxxx`。

- **--directory** (*string*) -

    表示外部存储中的目标目录。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz backup export --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--integration-id integ-xxxx
```
