---
title: "regions | Cloud"
slug: /cli/cli/Cluster-regions
sidebar_label: "regions"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出某个云服务提供商的所有可用区域。 | Cloud"
type: docx
token: YHtudYo81oBKruxujL5cw0yZnxd
sidebar_position: 8
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - regions
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# regions

此操作列出某个云服务提供商的所有可用区域。

## 概述\{#synopsis}

```bash
zilliz cluster regions
--cloud-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**选项：**

- **--cloud-id** (*string*) -

    指定云服务提供商。可能的值包括：`aws`、`gcp` 和 `azure`。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出格式设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
# List all regions
zilliz cluster regions

# List AWS regions only
zilliz cluster regions --cloud-id aws
```
