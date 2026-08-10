---
title: "providers | Cloud"
slug: /cli/cli/Cluster-providers
sidebar_label: "providers"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有适用的云服务提供商。 | Cloud"
type: docx
token: Rhked7rPvopHixxQZe6czSUwnvf
sidebar_position: 7
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - cloud
  - providers
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# providers

此操作会列出所有适用的云服务提供商。

## 概要\{#synopsis}

```bash
zilliz cluster providers
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz cluster providers
```
