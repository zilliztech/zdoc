---
title: "Cnalphanumonlyフィルター | Cloud"
slug: /cnalphanumonly-filter
sidebar_label: "Cnalphanumonlyフィルター"
beta: PUBLIC
notebook: FALSE
description: "cnalphanumonly`フィルター`は、漢字、英字、数字以外の文字を含むトークンを削除します。 | Cloud"
type: origin
token: VOZNwjxAXibAJTk7ItucFIZBnRf
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - cnalphanumonly
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cnalphanumonlyフィルター

cnalphanumonly`フィルター`は、漢字、英字、数字以外の文字を含むトークンを削除します。

## コンフィギュレーション{#}

cnalphanumonly`フィルター`は、Zilliz Cloudに組み込まれています。使用するには、単に`filter`セクション内の`analyser_params`で名前を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["cnalphanumonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("cnalphanumonly"));
```

</TabItem>
</Tabs>

cnalphanumonly`フィルター`はトークナイザーによって生成された用語に作用するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、Tokenizer Referenceを参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

## 出力の例{#}

cnalphanumonlyフィルタがテキストを処理する方法の例`を`次に示します。

**オリジナルテキスト**:

```python
"Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"
```

**予想される出力**:

```python
["Milvus", "是", "LF", "AI", "Data", "Foundation", "下", "的", "一个", "开源", "项目", "以", "Apache", "2.0", "许可", "发布"]
```

