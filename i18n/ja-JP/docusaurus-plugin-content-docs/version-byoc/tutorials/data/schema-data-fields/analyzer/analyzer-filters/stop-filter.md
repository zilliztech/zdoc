---
title: "ストップフィルター | BYOC"
slug: /stop-filter
sidebar_label: "ストップフィルター"
beta: PUBLIC
notebook: FALSE
description: "ストップフィルター（stop）は、トークン化されたテキストから指定された`ストップ`ワードを削除し、一般的で意味のない単語を取り除くのに役立ちます。ストップワードのリストは、`stopwords`パラメータを使用して設定できます。 | BYOC"
type: origin
token: QEx8ww1OXi76kWkYvfgcWTognzd
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - stop
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ストップフィルター

ストップフィルター（stop）は、トークン化されたテキストから指定された`ストップ`ワードを削除し、一般的で意味のない単語を取り除くのに役立ちます。ストップワードのリストは、`stop_words`パラメータを使用して設定できます。

## コンフィギュレーション{#configuration}

Zilliz Cloudのカスタムフィルターであるlengthフィルターを使用するには、フィルター設定で`"type":"stop"`を指定し、ストップワードのリストを提供する`stop_words`パラメーターを指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("of", "to", "_english_"));
                }}
        )
);
```

</TabItem>
</Tabs>

このストップフィルタは、以下の設定可能なパラメータを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から削除する単語のリストです。デフォルトでは、一般的な英語のストップワードを含む定義済みの<code>_english_</code>リストが使用されます。_english_の詳細<code>は</code>こちらをご覧くださ<a href="https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/stop_words.rs">い</a>。</p></td>
   </tr>
</table>

トークナイザーによって生成された用語に基づいて`ストップ`フィルターが動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、「[トークナイザーリファレンス](./analyzer-tokenizers)」を参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#example-output}

以下は、ストップフィルターがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"The stop filter allows control over common stop words for text processing."
```

**予想される出力**（`stop_words:["the","over","_english_"]`）:

```python
["The", "stop", "filter", "allows", "control", "common", "stop", "words", "text", "processing"]
```

