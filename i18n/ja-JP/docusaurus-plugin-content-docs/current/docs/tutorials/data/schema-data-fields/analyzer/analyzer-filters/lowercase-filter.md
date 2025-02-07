---
title: "小文字のフィルター | Cloud"
slug: /lowercase-filter
sidebar_label: "小文字のフィルター"
beta: PUBLIC
notebook: FALSE
description: "トークナイザーによって生成された用語を`小文字`に変換し、検索を大文字と小文字を区別しないようにします。例えば、`[\"High\",\"Performance\",\"Vector\",\"Database\"]`を`[\"high\",\"performance\",\"vector\",\"database\"]に変換できます`。 | Cloud"
type: origin
token: FJP5wcWUyi83kckMXCqciEEBnpc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - lowercase
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 小文字のフィルター

トークナイザーによって生成された用語を`小文字`に変換し、検索を大文字と小文字を区別しないようにします。例えば、`["High","Performance","Vector","Database"]`を`["high","performance","vector","database"]に変換できます`。

## コンフィギュレーション{#}

この`小文字`のフィルタは、Zilliz Cloudに組み込まれています。このフィルタを使用するには、`filter`セクションの`analyer_params`で名前を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"],
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

トークナイザーによって生成された用語に基づいて`小文字`のフィルターが動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、Tokenizer Referenceを参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

## 出力の例{#}

以下は、`小文字`フィルタがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"The Lowercase Filter Ensures Uniformity In Text Processing."
```

**予想される出力**:

```python
["the", "lowercase", "filter", "ensures", "uniformity", "in", "text", "processing"]
```
