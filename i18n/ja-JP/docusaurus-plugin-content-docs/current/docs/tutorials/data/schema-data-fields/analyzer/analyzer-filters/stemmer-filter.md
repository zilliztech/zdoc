---
title: "ステマー | Cloud"
slug: /stemmer-filter
sidebar_label: "ステマー"
beta: PUBLIC
notebook: FALSE
description: "ステマーフィルターは`、`単語を基本形またはルート形に縮小します(ステミングとして知られています)。これにより、異なるイントネーション間で類似した意味を持つ単語をより簡単に一致させることができます。`ステマー`フィルターは複数の言語をサポートしており、さまざまな言語的文脈で効果的な検索と索引付けが可能です。 | Cloud"
type: origin
token: RimDwyZjCiOQdTkKqtacWeVDnac
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - stemmer
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ステマー

ステマーフィルターは`、`単語を基本形またはルート形に縮小します(ステミングとして知られています)。これにより、異なるイントネーション間で類似した意味を持つ単語をより簡単に一致させることができます。`ステマー`フィルターは複数の言語をサポートしており、さまざまな言語的文脈で効果的な検索と索引付けが可能です。

## コンフィギュレーション{#}

ステマー`フィルター`は、Zilliz Cloud[のカスタムフィルター](null)です。使用するには、フィルター設定で`"type":"stemmer"`を指定し、ステミングに使用する`言語`を選択するための言語パラメータを指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # Specifies the filter type as stemmer
        "language": "english", # Sets the language for stemming to English
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
                    put("type", "stemmer");
                    put("language", "english");
                }}
        )
);
```

</TabItem>
</Tabs>

ステマーフィルター`は`、以下の設定可能なパラメーターを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>言語</code></p></td>
     <td><p>ステミング処理の言語を指定します。サポートされる言語は以下の通りです:<code>"アラビア語"</code>,<code>"デンマーク語"</code>,<code>"オランダ語"</code>,<code>"英語"</code>,<code>"フィンランド語"</code>,<code>"フランス語"</code>,<code>"ドイツ語"</code>,<code>"ギリシャ語"</code>,<code>"ハンガリー語"</code>,<code>"イタリア語"</code>,<code>"ノルウェー語"</code>,<code>"ポルトガル語"</code>,<code>"ルーマニア語"</code>,<code>"ロシア語"</code>,<code>"スペイン語"</code>,<code>"スウェーデン語"</code>,<code>"タミル語"</code>,<code>"""</code></p></td>
   </tr>
</table>

ステマー`フィルター`はトークナイザーによって生成された用語に基づいて動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、Tokenizer Referenceを参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](null)を参照してください。

## 出力の例{#}

以下は、`ステマー`フィルターがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"running runs looked ran runner"
```

**予想される出力**（`言語:「英語」`）:

```python
["run", "run", "look", "ran", "runner"]
```

