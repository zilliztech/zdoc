---
title: "suspend | Cloud"
slug: /cli/cli/Cluster-suspend
sidebar_label: "suspend"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会挂起一个正在运行的集群。挂起将停止计算费用。 | Cloud"
type: docx
token: RjlQdGJyzolWm0xZVyUc6yAdnyc
sidebar_position: 10
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - suspend
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# suspend

此操作会挂起一个正在运行的集群。挂起将停止计算费用。

## 概要\{#synopsis}

```bash
zilliz cluster suspend
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    指定要挂起的集群 ID。

    如果已使用 `zilliz context set` 配置了集群，则在未配置此选项时会自动应用该配置。

- **--output, -o** (*string*) -

    指定输出格式。可能的值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz cluster suspend --cluster-id in01-xxxxxxxxxxxx
```
