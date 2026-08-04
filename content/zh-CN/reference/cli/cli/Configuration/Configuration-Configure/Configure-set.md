---
title: "set | Cloud"
slug: /cli/cli/Configure-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于设置配置值。 | Cloud"
type: docx
token: Jp9VdKpVoooz9ix1vYMcAun4nwe
sidebar_position: 4
keywords: 
  - 音频相似性搜索
  - 弹性向量数据库
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# set

此操作用于设置配置值。

<Admonition type="info" icon="📘" title="说明">

你也可以改为运行 `zilliz configure`，并按照交互式引导进行操作。设置 `api_key` 可作为 `zilliz login` 的替代方式。

</Admonition>

## 用法\{#usage}

```bash
zilliz configure set <KEY> <VALUE>
```

**选项：**

- **KEY** (*string*) -

    **[必需]**

    表示配置项的名称。目前仅支持 `api_key`。

- **VALUE** (*string*) -

    表示配置项的值。

## 示例\{#example}

```bash
# set api key
zilliz configure set api_key <YOUR_API_KEY>
```
