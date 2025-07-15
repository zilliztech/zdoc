---
title: "Alphanumonlyフィルター | BYOC"
slug: /alphanumonly-filter
sidebar_label: "Alphanumonlyフィルター"
beta: FALSE
notebook: FALSE
description: "アルファヌモンリーフィルター（Alphanumonly）は、非ASCII文字を含むトークンを削除し、英数字の用語のみを保持します。このフィルターは、特殊文字や記号を除いて、基本的な文字と数字のみが関連するテキストを処理するのに役立ちます。 | BYOC"
type: origin
token: WN4uw8LKpiA2trkQsk0cM7A4nLa
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - alphanumonly
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Alphanumonlyフィルター

アルファヌモンリーフィルター（Alphanumonly）は、非ASCII文字を含むトークンを削除し、英数字の用語のみを保持します。このフィルターは、特殊文字や記号を除いて、基本的な文字と数字のみが関連するテキストを処理するのに役立ちます。

## コンフィギュレーション{#configuration}

アルファ`モンリー`フィルターは、Zilliz Cloudに組み込まれています。使用するには、フィルターセクション内の`analyzer_params`で名前を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["alphanumonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("alphanumonly"));
```

</TabItem>
</Tabs>

アルファヌモンリーフィルターはトークナイザーによって生成された用語で動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、「[トークナイザーリファレンス](./analyzer-tokenizers)」を参照してください。

`analyzer_params`を定義した後、コレクションスキーマを定義する際にVARCHARフィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#example-output}

アルファベット順のフィルタがテキストを処理する方法の例`を`以下に示します。

**オリジナルテキスト**:

```python
"Milvus 2.0 @ Scale! #AI #Vector_Databasé"
```

**予想される出力**:

```python
["Milvus", "2", "0", "Scale", "AI", "Vector"]
```

