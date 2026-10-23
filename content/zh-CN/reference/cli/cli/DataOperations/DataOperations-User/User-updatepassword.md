---
title: "update-password | Cloud"
slug: /cli/cli/User-updatepassword
sidebar_label: "update-password"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新用户密码。 | Cloud"
type: docx
token: AB6Hd6NHUoNLXIxgXywc3hmtnjc
sidebar_position: 7
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - update-password
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update-password

此操作会更新用户密码。

<Admonition type="info" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz user update-password
--user <value>
--password <value>
--new-password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--user** (*string*) -

    **[必需]**

    指示用户名。

- **--password** (*string*) -

    **[必需]**

    指示当前密码。

- **--new-password** (*string*) -

    **[必需]**

    指示新密码。

    密码应为至少包含 **8** 个字符的字符串，并且包含以下选项中的 **2** 种类型：

    - 大写字母（A-Z）

    - 小写字母（a-z）

    - 数字（0-9）

    - 特殊字符（`!`、`@`、`#` 等）

- **--output, -o** (*string*) -

    指示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示在输出设置为 `table` 或 `csv` 时是否省略表头行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz user update-password --user my_user --password old_pass --new-password new_pass
```
