---
title: "modify | Cloud"
slug: /cli/cli/Cluster-modify
sidebar_label: "modify"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、割り当てられた CU 数や作成するレプリカ数のスケーリングなど、クラスターの設定を変更します。 | Cloud"
type: docx
token: AYlXdnqMKoQOzRxSbWScn0A5nqf
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - modify
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# modify

この操作では、割り当てられた CU 数や作成するレプリカ数のスケーリングなど、クラスターの設定を変更します。

## Description\{#description}

このコマンドを使用すると、指定したクラスターの CU サイズとレプリカ数を変更できます。このコマンドは Dedicated クラスターにのみ適用されます。

実行中

## Synopsis\{#synopsis}

```bash
zilliz cluster modify
--cluster-id <value>
[--cu-size <value>]
[--replica <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    変更するクラスターの ID を示します。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--cu-size** (*integer*) -

    この操作後のコンピュートユニット（CU）数を示します。

    CU は、データの並列処理に使用される計算リソースの基本単位であり、CU のタイプごとに CPU、メモリ、ストレージの組み合わせが異なります。CU の概念は **Dedicated** クラスターにのみ適用されます。

    - **Standard** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 32 以下である必要があります。

    - **Enterprise** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 1,024 以下である必要があります。

- **--replica** (*integer*) -

    この操作後のレプリカ数を示します。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

- **--body** (*string*) -

    以下のスキーマに一致する JSON ペイロードを示します。具体例については、[Modify Cluster](/reference/restful/modify-cluster-v2) を参照してください。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "modify cluster",
        "type": "object",
        "properties": {
            "cuSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            },
            "replica": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            }
        },
        "required": [
            "cuSize"
        ]
    }
    ```

## Example\{#example}

```bash
# 2 CUs にスケール
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --cu-size 2

# レプリカを設定
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --replica 2
```
