---
title: "set | Cloud"
slug: /cli/cli/Configure-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は構成値を設定します。 | Cloud"
type: docx
token: Jp9VdKpVoooz9ix1vYMcAun4nwe
sidebar_position: 4
keywords: 
  - 音声類似検索
  - Elastic vector database
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

この操作は構成値を設定します。

<Admonition type="info" icon="📘" title="注意">

`zilliz configure` を代わりに実行し、対話型ガイダンスに従うこともできます。`api_key` の設定は、`zilliz login` の代替として使用できます。

</Admonition>

## Usage\{#usage}

```bash
zilliz configure set <KEY> <VALUE>
```

**OPTIONS:**

- **KEY** (*string*) -

    **[REQUIRED]**

    構成項目の名前を示します。現在は、`api_key` のみが適用可能です。

- **VALUE** (*string*) -

    構成項目の値を示します。

## Example\{#example}

```bash
# set api key
zilliz configure set api_key <YOUR_API_KEY>
```
