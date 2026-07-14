---
title: "delete | Cloud"
slug: /cli/cli/Volume-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は volume を削除します。 | Cloud"
type: docx
token: CgVKdrm2YoAiM8xBvFacmxpWnrb
sidebar_position: 2
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

この操作は volume を削除します。

## Synopsis\{#synopsis}

```bash
zilliz volume delete
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## オプション\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    削除する volume の名前を指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。使用可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    output が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## 例\{#example}

```bash
zilliz volume delete --name my-volume
```
