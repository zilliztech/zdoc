---
title: "標準トークナイザー | BYOC"
slug: /standard-tokenizer
sidebar_label: "標準トークナイザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの標準トークナイザー（`standard`）Zilliz Cloudは、スペースと句読点に基づいてテキストを分割するため、ほとんどの言語に適しています。 | BYOC"
type: origin
token: AidtwEFV0idlPOkHa10cJu4onBg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - standard-tokenizer
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 標準トークナイザー

Zilliz Cloudの標準トークナイザー（`standard`）Zilliz Cloudは、スペースと句読点に基づいてテキストを分割するため、ほとんどの言語に適しています。

## コンフィギュレーション{#}

アナライザーを標準トークナイザーで設定するには、`analyzer_params`でトークナイザーを`standard`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
```

</TabItem>
</Tabs>

以下のコードは、標準トークナイザーと小文字フィルターを組み合わせて動作するアナライザーを定義しています。例えば、

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>設定を簡単にするには、<a href="./standard-analyzer">標準アナライザ</a>を使用します。これは、標準トークナイザと<a href="./lowercase-filter">小文字フィルター</a>を組み合わせたものです。</p>

</Admonition>

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#}

以下は、`標準`トークナイザーがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"The Milvus vector database is built for scale!"
```

**予想される出力**:

```python
["The", "Milvus", "vector", "database", "is", "built", "for", "scale"]
```

