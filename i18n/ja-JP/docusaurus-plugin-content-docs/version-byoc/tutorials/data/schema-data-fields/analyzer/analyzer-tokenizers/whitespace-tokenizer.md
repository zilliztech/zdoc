---
title: "ホワイトスペース | BYOC"
slug: /whitespace-tokenizer
sidebar_label: "ホワイトスペース"
beta: FALSE
notebook: FALSE
description: "ホワイトスペーストークナイザ（`whitespace`）は、単語の間にスペースがあるときにテキストを用語に分割します。 | BYOC"
type: origin
token: NZ6gwJIr8isL3KkgVvxcIqsEnjg
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - whitespace-tokenizer
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ホワイトスペース

ホワイトスペーストークナイザ（`whitespace`）は、単語の間にスペースがあるときにテキストを用語に分割します。

## コンフィギュレーション{#configuration}

ホワイトスペーストークナイザを使用してアナライザを設定するには、`tokenizer`を`whitespace`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>
</Tabs>

空白トークナイザーは、1つ以上のフィルターと組み合わせて使用できます。例えば、以下のコードは、ホワイトスペーストークナイザと[小文字フィルター](./lowercase-filter)を使用するアナライザーを定義しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>
</Tabs>

`analyzer_params`を定義した後、コレクションスキーマを定義する際にVARCHARフィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#example-output}

以下は、`空白`トークナイザーがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"The Milvus vector database is built for scale!"
```

**予想される出力**:

```python
["The", "Milvus", "vector", "database", "is", "built", "for", "scale!"]
```

