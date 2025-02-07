---
title: "ASCII折りたたみフィルター | Cloud"
slug: /ascii-folding-filter
sidebar_label: "ASCII折りたたみフィルター"
beta: PUBLIC
notebook: FALSE
description: "ASCII`折りたたみ` フィルターは、基本ラテンUnicodeブロック外の文字をASCIIに変換します。例えば、`í`のような文字を`i`に変換し、特に多言語コンテンツに対してテキスト処理をより簡単かつ一貫性のあるものにします。 | Cloud"
type: origin
token: THEqwbma1iAgz8k1TD2cdO7wnTh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - ascii folding
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ASCII折りたたみフィルター

ASCII`折りたたみ` フィルターは、[基本ラテンUnicodeブロック](https://en.wikipedia.org/wiki/Basic_Latin_(Unicode_block))(最初の127文字のASCII文字)外の文字をASCIIに変換します。例えば、`í`のような文字を`i`に変換し、特に多言語コンテンツに対してテキスト処理をより簡単かつ一貫性のあるものにします。

## コンフィギュレーション{#}

アスキー`フォールディング`フィルターは、Zilliz Cloudに組み込まれています。使用するには、`filter`セクション内の`analyser_params`で名前を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["asciifolding"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("asciifolding"));
```

</TabItem>
</Tabs>

アスキー`フォールディング`フィルターはトークナイザーによって生成された用語に基づいて動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、Tokenizer Referenceを参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

## 出力の例{#}

以下は、ASCII折りたたみフィルタがテキストを処理する方法`の`例です:

**オリジナルテキスト**:

```python
"Café Möller serves crème brûlée and piñatas."
```

**予想される出力**:

```python
["Cafe", "Moller", "serves", "creme", "brulee", "and", "pinatas"]
```

