---
title: "Cncharonlyフィルター | Cloud"
slug: /cncharonly-filter
sidebar_label: "Cncharonlyフィルター"
beta: PUBLIC
notebook: FALSE
description: "cncharonlyフィルター`は`、中国語以外の文字を含むトークンを削除します。このフィルターは、他の文字、数字、または記号を含むトークンを除外して、中国語のテキストだけに焦点を当てたい場合に便利です。 | Cloud"
type: origin
token: He86wNJrWi74OskWsWVcYt1anRh
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - cncharonly
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cncharonlyフィルター

cncharonlyフィルター`は`、中国語以外の文字を含むトークンを削除します。このフィルターは、他の文字、数字、または記号を含むトークンを除外して、中国語のテキストだけに焦点を当てたい場合に便利です。

## コンフィギュレーション{#}

cncharonly`フィルター`は、Zilliz Cloudに組み込まれています。使用するには、単に`filter`セクション内の`analyer_params`で名前を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["cncharonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("cncharonly"));
```

</TabItem>
</Tabs>

cncharonly`フィルター`はトークナイザーによって生成された項に基づいて動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、Tokenizer Referenceを参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

## 出力の例{#}

以下は、cncharonlyフィルタがテキストを処理する方法`の`例です。

**オリジナルテキスト**:

```python
"Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"
```

**予想される出力**:

```python
["是", "下", "的", "一个", "开源", "项目", "以", "许可", "发布"]
```
