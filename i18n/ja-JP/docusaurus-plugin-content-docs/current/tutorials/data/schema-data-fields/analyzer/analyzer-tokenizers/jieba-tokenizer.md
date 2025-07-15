---
title: "ジエバ | Cloud"
slug: /jieba-tokenizer
sidebar_label: "ジエバ"
beta: FALSE
notebook: FALSE
description: "ジエバトークナイザ（`jieba`）は、中国語のテキストを構成語に分解して処理します。 | Cloud"
type: origin
token: YSwBw3hHiiLCFlkkl1pchXK5nHg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - jieba-tokenizer
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ジエバ

ジエバトークナイザ（`jieba`）は、中国語のテキストを構成語に分解して処理します。

## コンフィギュレーション{#configuration}

ジエバトークナイザを使用してアナライザを設定するには、`analyzer_params`で`tokenizer`を`jieba`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>
</Tabs>

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#example-output}

以下は`jieba`トークナイザーがテキストを処理する方法の例です:

**オリジナルテキスト**:

```python
"Milvus 是一个高性能、可扩展的向量数据库！"
```

**予想される出力**:

```python
["Milvus", " ", "是", "一个", "高性", "性能", "高性能", "、", "可", "扩展", "的", "向量", "数据", "据库", "数据库", "！"]
```

