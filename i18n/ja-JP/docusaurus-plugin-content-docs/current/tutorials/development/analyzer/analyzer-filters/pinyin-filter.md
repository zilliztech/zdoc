---
title: "Pinyin | Cloud"
slug: /pinyin-filter
sidebar_label: "pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "中国語テキスト検索では、多くの場合、インデックス化されたテキストに表示されるとおりに中国語文字を正確に入力する必要があります。名前検索、オートコンプリート、search-as-you-type ワークフローでは、ユーザーは中国語文字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` フィルターは analyzer の出力に Pinyin token を追加するため、別個の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力と一致させることができます。 | Cloud"
type: origin
token: EhXXwmJzBi8pg9kJcC4ccm9OnDe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinyin

中国語テキスト検索では、多くの場合、インデックス化されたテキストに表示されるとおりに中国語文字を正確に入力する必要があります。名前検索、オートコンプリート、search-as-you-type ワークフローでは、ユーザーは中国語文字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` フィルターは analyzer の出力に Pinyin token を追加するため、別個の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力と一致させることができます。

`pinyin` フィルターは通常、中国語テキスト用の [Jieba](./jieba-tokenizer) tokenizer とともに使用されます。これはカスタム analyzer filter パイプラインで動作し、同じ中国語 token に対して複数の Pinyin token 形式を出力できます。

## 設定\{#configuration}

デフォルトのオプションを使用するには、`analyzer_params` の `filter` セクションで `"pinyin"` を指定します。

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-next-line
    "filter": ["pinyin"],
}
```

この省略形は元の中国語 token を保持し、文字レベルの Pinyin token を出力します。これらのオプションを明示的に有効にしない限り、結合された Pinyin や Pinyin の頭文字は出力されません。

完全に制御するには、フィルターをオブジェクトとして指定し、Zilliz Cloud が出力する Pinyin token 形式を設定します。

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

このフィルターは以下のパラメーターを受け付けます。

| **パラメーター** | **型** | **デフォルト** | **説明** |
| --- | --- | --- | --- |
| `keep_original` | Boolean | `true` | analyzer の出力に元の中国語 token を保持します。 |
| `keep_full_pinyin` | Boolean | `true` | 文字レベルの Pinyin token を出力します。たとえば、`中文` は `zhong` と `wen` を生成します。 |
| `keep_joined_full_pinyin` | Boolean | `false` | 各ソース token に対して結合された Pinyin token を出力します。たとえば、`中文` は `zhongwen` を生成します。 |
| `keep_separate_first_letter` | Boolean | `false` | 各ソース token に対して Pinyin 頭文字 token を出力します。たとえば、`中文` は `zw` を生成します。 |

このフィルターは tokenizer によって生成された token に対して動作します。中国語テキストでは、`jieba` などの tokenizer とともに使用してください。

## 例\{#examples}

analyzer 設定を collection スキーマに適用する前に、`run_analyzer` でその動作を確認します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "中文测试"
```

### 文字レベルの Pinyin で中国語テキストを一致させる\{#match-chinese-text-with-character-level-pinyin}

デフォルトの `pinyin` フィルターは元の中国語 token を保持し、文字レベルの Pinyin token を出力します。

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

### 結合された Pinyin で中国語用語を一致させる\{#match-chinese-terms-with-joined-pinyin}

中国語の用語を、その完全に結合された Pinyin 形式と一致させる必要がある場合は、`keep_joined_full_pinyin` を有効にします。

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

### Pinyin の頭文字で中国語用語を一致させる\{#match-chinese-terms-with-pinyin-initials}

中国語の用語を、その Pinyin 形式の頭文字と一致させる必要がある場合は、`keep_separate_first_letter` を有効にします。

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
