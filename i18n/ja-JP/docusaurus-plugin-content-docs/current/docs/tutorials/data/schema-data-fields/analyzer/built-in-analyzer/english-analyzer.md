---
title: "英語の | Cloud"
slug: /english-analyzer
sidebar_label: "英語の"
beta: PUBLIC
notebook: FALSE
description: "の`英語`アナライザZilliz Cloudは、英語のテキストを処理するように設計されています。 | Cloud"
type: origin
token: T7dPwzkWUinkIpkskWMcrmb3nmf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - english analyzer
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 英語の

の`英語`アナライザZilliz Cloudは、英語のテキストを処理するように設計されています。

### の定義{#}

この`英語`アナライザは、次のコンポーネントを使用します。

- **トークナイザー**:`標準`[トークナイザー](null)を使用して、テキストを離散的な単語単位に分割します。

- **フィルター**:包括的なテキスト処理のための複数のフィルターが含まれています

    - `lowercase`:すべてのトークンを小文字に変換し、大文字小文字を区別しない検索を可能にします。

    - `stemmer`:単語をルート形式に縮小して、より広いマッチングをサポートします(例:「ランニング」は「ラン」になります)。

    - `stop_words`:一般的な英語のストップワードを削除して、テキスト内のキーワードにフォーカスします。

英語アナライザの機能`は`、次のカスタムアナライザ構成と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
        "tokenizer": "standard",
        "filter": [
                "lowercase",
                {
                        "type": "stemmer",
                        "language": "english"
                }, {
                        "type": "stop",
                        "stop_words": "_english_"
                }
        ]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stemmer");
                    put("language", "english");
                }},
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Collections.singletonList("_english_"));
                }}
        )
);
```

</TabItem>
</Tabs>

### コンフィギュレーション{#}

フィールドに`英語`アナライザを適用するには、単に`type`を`英語`に設定して`、必要`に応じてオプションのパラメータを含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
```

</TabItem>
</Tabs>

この`英語`アナライザは、次のオプションパラメータを受け入れます。

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

カスタムストップワードを使用した設定例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "the"));
```

</TabItem>
</Tabs>

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

### 出力の例{#}

ここでは、`英語`のアナライザーがテキストを処理する方法を紹介します。

**オリジナルテキスト**:

```python
"The Milvus vector database is built for scale!"
```

**予想される出力**:

```python
["milvus", "vector", "databas", "built", "scale"]
```

