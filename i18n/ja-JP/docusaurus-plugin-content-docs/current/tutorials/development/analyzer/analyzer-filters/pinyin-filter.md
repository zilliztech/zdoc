---
title: "Pinyin | Cloud"
slug: /pinyin-filter
sidebar_label: "pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "中国語テキスト検索では、インデックス化されたテキストに現れるとおりに中国語文字を正確に入力する必要があることがよくあります。名前検索、オートコンプリート、入力しながら検索するワークフローでは、ユーザーは中国語文字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` filter は analyzer の出力に Pinyin トークンを追加するため、別個の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力に一致させることができます。 | Cloud"
type: origin
token: EhXXwmJzBi8pg9kJcC4ccm9OnDe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinyin

中国語テキスト検索では、インデックス化されたテキストに現れるとおりに中国語文字を正確に入力する必要があることがよくあります。名前検索、オートコンプリート、入力しながら検索するワークフローでは、ユーザーは中国語文字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` filter は analyzer の出力に Pinyin トークンを追加するため、別個の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力に一致させることができます。

`pinyin` filter は通常、中国語テキスト用の [Jieba](./jieba-tokenizer) tokenizer と一緒に使用します。これはカスタム analyzer filter パイプライン内で動作し、同じ中国語トークンに対して複数の Pinyin トークン形式を出力できます。

## Configuration\{#configuration}

デフォルトオプションを使用するには、`analyzer_params` の `filter` セクションで `"pinyin"` を指定します。

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-next-line
    "filter": ["pinyin"],
}
```

この簡略記法では、元の中国語トークンを保持し、文字単位の Pinyin トークンを出力します。結合された Pinyin や Pinyin の頭文字は、それらのオプションを明示的に有効にしない限り出力されません。

完全に制御するには、filter をオブジェクトとして指定し、Zilliz Cloud が出力する Pinyin トークン形式を設定します。

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-start
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": True,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": False,
        }
    ],
    # highlight-end
}
```

この filter は次のパラメータを受け付けます。

| **Parameter** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `keep_original` | Boolean | `true` | analyzer の出力に元の中国語トークンを保持します。 |
| `keep_full_pinyin` | Boolean | `true` | 文字単位の Pinyin トークンを出力します。たとえば、`中文` は `zhong` と `wen` を生成します。 |
| `keep_joined_full_pinyin` | Boolean | `false` | ソーストークンごとに結合された Pinyin トークンを出力します。たとえば、`中文` は `zhongwen` を生成します。 |
| `keep_separate_first_letter` | Boolean | `false` | ソーストークンごとに Pinyin の頭文字トークンを出力します。たとえば、`中文` は `zw` を生成します。 |

この filter は tokenizer が生成したトークンに対して動作します。中国語テキストでは、`jieba` などの tokenizer と組み合わせて使用してください。

## Examples\{#examples}

analyzer 設定を collection スキーマに適用する前に、`run_analyzer` でその動作を確認してください。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "中文测试"
```

### Match Chinese text with character-level Pinyin\{#match-chinese-text-with-character-level-pinyin}

デフォルトの `pinyin` filter は、元の中国語トークンを保持し、文字単位の Pinyin トークンを出力します。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["pinyin"],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

期待される出力:

```plaintext
['中文', 'zhong', 'wen', '测试', 'ce', 'shi']
```

### Match Chinese terms with joined Pinyin\{#match-chinese-terms-with-joined-pinyin}

中国語の用語を完全な結合 Pinyin 形式に一致させる必要がある場合は、`keep_joined_full_pinyin` を有効にします。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": True,
            "keep_separate_first_letter": False,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

期待される出力:

```plaintext
['中文', 'zhongwen', '测试', 'ceshi']
```

### Match Chinese terms with Pinyin initials\{#match-chinese-terms-with-pinyin-initials}

中国語の用語をその Pinyin 形式の頭文字に一致させる必要がある場合は、`keep_separate_first_letter` を有効にします。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": True,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

期待される出力:

```plaintext
['中文', 'zw', '测试', 'cs']
```
