---
title: "Synonym | Cloud"
slug: /synonym-filter
sidebar_label: "Synonym"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`synonym` フィルターは、同義語辞書に従ってトークンを書き換え、検索時に関連する用語が一致するようにします。2 つの動作モードと、辞書を指定する 2 つの方法をサポートしています | Cloud"
type: origin
token: Wo5xwhRaWitCP9kXOG2c082en2c
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Synonym

`synonym` フィルターは、同義語辞書に従ってトークンを書き換え、検索時に関連する用語が一致するようにします。2 つの動作モードと、辞書を指定する 2 つの方法をサポートしています。

- **動作モード** — `expand` モードでは元のトークンを保持しつつ追加の同義語を一緒に出力します。正規化モード (`expand: false`) では、トークンを正規形に書き換えます。

- **辞書ソース** — 小規模な辞書は `synonyms` 配列を使ってフィルター設定にインラインで埋め込めます。大規模な辞書は [file resource](./manage-file-resources) として保存し、`synonyms_file` で参照する必要があります。

## 辞書フォーマット\{#dictionary-format}

同義語辞書はプレーンテキストのドキュメント（またはインライン配列）で、各行が 1 つのルールを定義します。2 種類のルール形式がサポートされています。

### マッピングルール\{#mapping-rule}

```plaintext
fast, quick => speedy
```

左側のトークン (`fast`, `quick`) は右側のトークン (`speedy`) に書き換えられます。複数のターゲットも指定できます。

```plaintext
small, little => tiny, compact
```

`expand: true` の場合、元のトークンはターゲットと一緒に保持されます。

- 入力 `fast`、`expand: true` の場合 → `fast`, `speedy`

- 入力 `fast`、`expand: false` の場合 → `speedy`

### 等価グループ\{#equivalence-group}

```plaintext
happy, joyful, cheerful
```

列挙されたすべてのトークンは等価と見なされます。

- `expand: true` の場合、グループ内の任意のトークンが出現すると、そのグループ内のすべてのトークンが出力されます。入力 `happy` → `happy`, `joyful`, `cheerful`。

- `expand: false` の場合、すべての出現はグループ内の最初のトークンに書き換えられます。入力 `joyful` → `happy`。入力 `happy` はすでに最初のトークンであるため変更されません。

## 設定\{#configuration}

`synonym` フィルターはカスタムフィルターです。`"type": "synonym"` を指定し、`synonyms`（インライン）または `synonyms_file`（外部）の少なくとも一方、および `expand` フラグをあわせて指定します。

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        {
            "type": "synonym",
            "synonyms": [                       # inline rules (optional)
                "fast, quick => speedy",
                "happy, joyful, cheerful",
            ],
            "synonyms_file": {                  # external rules (optional)
                "type": "remote",
                "resource_name": "en_synonyms",
                "file_name": "synonyms.txt",
            },
            "expand": True,
        }
    ],
}
```

`synonym` フィルターは次のパラメーターを受け付けます。

| **Parameter** | **Description** | **Default** |
| --- | --- | --- |
| `synonyms` | ルール文字列のインライン配列。各文字列は上記で説明した辞書フォーマットを使用します。小規模な辞書（最大で数十ルール程度）に適しています。 | — |
| `synonyms_file` | 同義語ルールを 1 行につき 1 つ格納した [file resource](./manage-file-resources) への参照です。大規模な辞書に使用します。以下の [外部辞書ファイル](./synonym-filter#external-dictionary-file) を参照してください。 | — |
| `expand` | ルールの適用方法を制御するブールフラグです。true は元のトークンを保持しつつ同義語を一緒に出力し、false はトークンを正規形（マッピングの右辺、または等価グループの最初のトークン）に書き換えます。 | false |

`synonyms`、`synonyms_file`、またはその両方を指定できます。両方が存在する場合、フィルターは 2 つのソースをマージします。このフィルターは tokenizer によって生成されたトークンに対して動作するため、[standard](./standard-tokenizer) tokenizer などの tokenizer と組み合わせる必要があります。

### 外部辞書ファイル\{#external-dictionary-file}

本番規模の辞書では、ファイルをリモート file resource として登録し、`synonyms_file` から参照します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the file once, then reference it from any analyzer that needs it.
client.add_file_resource(
    name="en_synonyms",
    path="file/synonyms.txt",     # full S3 object key, including rootPath
)

analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "synonym",
        "synonyms_file": {
            "type": "remote",
            "resource_name": "en_synonyms",
            "file_name": "synonyms.txt",
        },
        "expand": True,
    }],
}
```

完全なワークフロー（アップロード、登録、一覧表示、削除）および代替の `"type": "local"` 形式については、Manage File Resources を参照してください。

## 例\{#examples}

analyzer を collection スキーマに適用する前に、`run_analyzer` でその動作を確認してください。以下の例では簡潔さのためにインラインの `synonyms` 配列を使用しています。大規模な辞書では `synonyms_file` に置き換えてください。

### `expand: true` — 元のトークンを保持し、同義語を追加する\{#expand-true-keep-the-original-add-synonyms}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "synonym",
        "synonyms": [
            "fast, quick => speedy",
            "happy, joyful, cheerful",
        ],
        "expand": True,
    }],
}

print(client.run_analyzer(["a fast car"], analyzer_params))
# → [['a', 'fast', 'speedy', 'car']]

print(client.run_analyzer(["i am happy today"], analyzer_params))
# → [['i', 'am', 'happy', 'joyful', 'cheerful', 'today']]
```

`fast` と `happy` はどちらも保持され、それぞれの同義語が一緒に出力されます。

### `expand: false` — 正規形に書き換える\{#expand-false-rewrite-to-canonical-form}

```python
analyzer_params_norm = {
    "tokenizer": "standard",
    "filter": [{
        "type": "synonym",
        "synonyms": [
            "fast, quick => speedy",
            "happy, joyful, cheerful",
        ],
        "expand": False,
    }],
}

print(client.run_analyzer(["a fast car"], analyzer_params_norm))
# → [['a', 'speedy', 'car']]

print(client.run_analyzer(["i am happy today"], analyzer_params_norm))
# → [['i', 'am', 'happy', 'today']]
```

マッピングルールは `fast` を `speedy` に書き換えます。等価グループでは、`happy` はグループの最初のトークンであるため変更されません。入力に `joyful` または `cheerful` が含まれていた場合は、`happy` に書き換えられていたはずです。
