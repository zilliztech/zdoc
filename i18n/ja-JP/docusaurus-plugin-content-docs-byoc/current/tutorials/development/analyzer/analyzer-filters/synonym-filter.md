---
title: "同義語 | BYOC"
slug: /synonym-filter
sidebar_label: "同義語"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`synonym` フィルターは、同義語辞書に従ってトークンを書き換え、検索時に関連する用語が一致するようにします。2 つの動作モードと 2 つの辞書提供方法をサポートします | BYOC"
type: origin
token: Wo5xwhRaWitCP9kXOG2c082en2c
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 同義語

`synonym` フィルターは、同義語辞書に従ってトークンを書き換え、検索時に関連する用語が一致するようにします。2 つの動作モードと 2 つの辞書提供方法をサポートします。

- **動作モード** — `expand` モードでは元のトークンを保持し、それに加えて同義語を出力します。正規化モード（`expand: false`）では、トークンを正規形に書き換えます。

- **辞書ソース** — 小さな辞書は `synonyms` 配列を使ってフィルター設定にインラインで埋め込めます。大きな辞書は [file resource](./manage-file-resources) として保存し、`synonyms_file` 経由で参照する必要があります。

## 辞書形式\{#dictionary-format}

同義語辞書はプレーンテキストのドキュメント（またはインライン配列）で、各行が 1 つのルールを定義します。サポートされるルール形式は 2 種類あります。

### マッピングルール\{#mapping-rule}

```plaintext
fast, quick => speedy
```

左側のトークン（`fast`, `quick`）は右側のトークン（`speedy`）に書き換えられます。複数のターゲットも許可されます。

```plaintext
small, little => tiny, compact
```

`expand: true` の場合、元のトークンはターゲットとともに保持されます。

- 入力 `fast` で `expand: true` → `fast`, `speedy`

- 入力 `fast` で `expand: false` → `speedy`

### 等価グループ\{#equivalence-group}

```plaintext
happy, joyful, cheerful
```

列挙されたすべてのトークンは同等とみなされます。

- `expand: true` の場合、グループ内の任意のトークンが出現すると、そのグループ内のすべてのトークンが出力されます。入力 `happy` → `happy`, `joyful`, `cheerful`。

- `expand: false` の場合、すべての出現はグループ内の最初のトークンに書き換えられます。入力 `joyful` → `happy`。入力 `happy` はすでに最初のトークンであるため変更されません。

## 設定\{#configuration}

`synonym` フィルターはカスタムフィルターです。`"type": "synonym"` を指定し、`synonyms`（インライン）または `synonyms_file`（外部）の少なくとも一方に加えて、`expand` フラグも指定します。

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        {
            "type": "synonym",
            "synonyms": [                       # インラインルール（任意）
                "fast, quick => speedy",
                "happy, joyful, cheerful",
            ],
            "synonyms_file": {                  # 外部ルール（任意）
                "type": "remote",
                "resource_name": "en_synonyms",
                "file_name": "synonyms.txt",
            },
            "expand": True,
        }
    ],
}
```

`synonym` フィルターは次のパラメータを受け付けます。

| **Parameter** | **Description** | **Default** |
| --- | --- | --- |
| `synonyms` | ルール文字列のインライン配列です。各文字列は上記で説明した辞書形式を使用します。小さな辞書（数十ルール程度まで）に適しています。 | — |
| `synonyms_file` | 1 行に 1 つの同義語ルールを格納した [file resource](./manage-file-resources) への参照です。より大きな辞書に使用します。以下の [External dictionary file](./synonym-filter#external-dictionary-file) を参照してください。 | — |
| `expand` | ルールの適用方法を制御するブールフラグです。true は元のトークンを保持し、それに加えて同義語を出力します。false はトークンを正規形（マッピングの右辺、または等価グループの最初のトークン）に書き換えます。 | false |

`synonyms`、`synonyms_file`、またはその両方を指定できます。両方が存在する場合、フィルターは 2 つのソースをマージします。フィルターは tokenizer によって生成されたトークンに対して動作するため、[standard](./standard-tokenizer) tokenizer などの tokenizer と組み合わせる必要があります。

### 外部辞書ファイル\{#external-dictionary-file}

本番規模の辞書については、そのファイルをリモート file resource として登録し、`synonyms_file` から参照します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# ファイルは一度だけ登録し、それを必要とする任意の analyzer から参照します。
client.add_file_resource(
    name="en_synonyms",
    path="file/synonyms.txt",     # rootPath を含む完全な S3 オブジェクトキー
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

analyzer を collection スキーマに適用する前に、`run_analyzer` でその動作を確認してください。以下の例では簡潔にするためインラインの `synonyms` 配列を使用しています。より大きな辞書では `synonyms_file` に置き換えてください。

### `expand: true` — 元のトークンを保持し、同義語を追加\{#expand-true-keep-the-original-add-synonyms}

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

`fast` と `happy` はどちらも保持され、その同義語があわせて出力されます。

### `expand: false` — 正規形に書き換え\{#expand-false-rewrite-to-canonical-form}

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

マッピングルールは `fast` を `speedy` に書き換えます。等価グループでは、`happy` はグループ内の最初のトークンであるため変更されません。`joyful` または `cheerful` を含む入力であれば、`happy` に書き換えられていたはずです。
