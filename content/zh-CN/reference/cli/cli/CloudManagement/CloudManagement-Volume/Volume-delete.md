---
title: "delete | Cloud"
slug: /cli/cli/Volume-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将删除一个卷。 | Cloud"
type: docx
token: CgVKdrm2YoAiM8xBvFacmxpWnrb
sidebar_position: 2
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
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

此操作将删除一个卷。

## 概要\{#synopsis}

```bash
zilliz volume delete
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定要删除的卷名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz volume delete --name my-volume
```
