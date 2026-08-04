---
title: "delete | Cloud"
slug: /cli/cli/Cluster-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除集群。此操作不可逆。 | Cloud"
type: docx
token: S4Omd93kpoyuqtx4E7scLCoXnyB
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

此操作会删除集群。此操作不可逆。

## 描述\{#description}

删除集群也会清除其中存储的数据。请谨慎操作。在不带任何选项的情况下运行此命令，会触发一组交互式提示。

## 概要\{#synopsis}

```bash
zilliz cluster delete
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    指定要删除的集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未设置此选项时会自动应用该配置。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx

# Skip confirmation prompt
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx -y
```
