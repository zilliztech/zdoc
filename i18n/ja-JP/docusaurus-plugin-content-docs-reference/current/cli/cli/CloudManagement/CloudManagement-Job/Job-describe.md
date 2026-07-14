---
title: "describe | Cloud"
slug: /cli/cli/Job-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、非同期ジョブ（backup、restore、migration、import など）のステータスを取得します。 | Cloud"
type: docx
token: HrwTdhnBeoZwoBxokBJcQZWznKh
sidebar_position: 1
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

この操作は、非同期ジョブ（backup、restore、migration、import など）のステータスを取得します。

## Synopsis\{#synopsis}

```bash
zilliz job describe
--job-id <value>
[--wait]
[--timeout <value>]
[--interval <value>]
[--output <value>]
```

## Options\{#options}

- **--job-id** (*string*) -

    **[REQUIRED]**

    Job ID を指定します。たとえば、`job-xxxxxxxxxxxxxxxxxxxx` です。

- **--wait** (*boolean*) -

    ジョブが終了状態に達するまで待機するかどうかを指定します。

- **--timeout** (*integer*) -

    待機する最大秒数を指定します。デフォルト値は `1800` です。

- **--interval** (*integer*) -

    秒単位のポーリング間隔を指定します。デフォルト値は 5 で、Zilliz Cloud が指定されたジョブのステータスを 5 秒ごとに取得することを示します。

- **--output, -o** (*string*) -

    出力形式を指定します。選択肢: `json`, `table`, `text`, `yaml`, `csv`.

## Example\{#example}

```bash
zilliz job describe --job-id job-xxxxxx
```
