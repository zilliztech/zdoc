---
title: "標準アナライザ | Cloud"
slug: /standard-analyzer
sidebar_label: "標準アナライザ"
beta: PUBLIC
notebook: FALSE
description: "アナライザーが指定されていない場合、`標準`アナライザーはZilliz Cloudのデフォルトアナライザーです。文法ベースのトークン化を使用しているため、ほとんどの言語で効果的です。 | Cloud"
type: origin
token: GTKiw9mVgiK4nqktWaWcfWM5nzy
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - standard-analyzer
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 標準アナライザ

アナライザーが指定されていない場合、`標準`アナライザーはZilliz Cloudのデフォルトアナライザーです。文法ベースのトークン化を使用しているため、ほとんどの言語で効果的です。

## の定義{#}

この`標準`アナライザは以下からなる。

- **トークナイザー**:標準の`トーク`ナイザーを使用して、文法規則に基づいてテキストを個別の単語単位に分割します。詳細については、Standardを参照してください。

- **フィルター**:小文字`の`[フィルター](null)を使用して、すべてのトークンを小文字に変換し、大文字小文字を区別しない検索を可能にします。詳細については、

この`標準`アナライザの機能は、次のカスタムアナライザの設定と同等です。

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
analyzerParams.put("type", "english");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>
</Tabs>

## コンフィギュレーション{#}

フィールドに`標準`のアナライザを適用するには、単に`type`を`standard`に設定して`、必要`に応じてオプションのパラメータを含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
```

</TabItem>
</Tabs>

この`標準`アナライザは、以下のオプションパラメータを受け付けます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>ストップワード</code></p></td>
     <td><p>トークナイゼーションから削除されるストップワードのリストを含む配列です。デフォルトは<code>_english_</code>で、一般的な英語のストップワードの組み込みのセットです。</p></td>
   </tr>
</table>

カスタムストップワードの設定例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
    "stop_words", ["of"] # Optional: List of words to exclude from tokenization
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("of"));
```

</TabItem>
</Tabs>

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細については、[使用例](null)を参照してください。

## 出力の例{#}

以下は、`標準`アナライザがテキストを処理する方法です。

**オリジナルテキスト**:

```python
"The Milvus vector database is built for scale!"
```

**予想される出力**:

```python
["the", "milvus", "vector", "database", "is", "built", "for", "scale"]
```
