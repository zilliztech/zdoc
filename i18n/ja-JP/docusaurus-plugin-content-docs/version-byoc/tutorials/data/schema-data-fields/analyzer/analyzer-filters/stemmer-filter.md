---
title: "ステマー | BYOC"
slug: /stemmer-filter
sidebar_label: "ステマー"
beta: PUBLIC
notebook: FALSE
description: "ステマーフィルター（`stemmer`）は、単語を基本形またはルート形に縮小します(ステミングとして知られています)。これにより、異なるイントネーション間で類似した意味を持つ単語をより簡単に一致させることができます。ステマーフィルターは複数の言語をサポートしており、さまざまな言語的文脈で効果的な検索と索引付けが可能です。 | BYOC"
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
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ステマー

ステマーフィルター（`stemmer`）は、単語を基本形またはルート形に縮小します(ステミングとして知られています)。これにより、異なるイントネーション間で類似した意味を持つ単語をより簡単に一致させることができます。ステマーフィルターは複数の言語をサポートしており、さまざまな言語的文脈で効果的な検索と索引付けが可能です。

## コンフィギュレーション{#configuration}

ステマーフィルターは、Zilliz Cloudのカスタムフィルターです。使用するには、フィルター設定で`"type":"stemmer"`を指定し、ステミングに使用する`language`を選択するための言語パラメータを指定してください。

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

ステマーフィルターは、以下の設定可能なパラメーターを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>language</code></p></td>
     <td><p>ステミング処理の言語を指定します。サポートされる言語は以下の通りです:<code>"arabic"</code>, <code>"danish"</code>, <code>"dutch"</code>, <code>"english"</code>, <code>"finnish"</code>, <code>"french"</code>, <code>"german"</code>, <code>"greek"</code>, <code>"hungarian"</code>, <code>"italian"</code>, <code>"norwegian"</code>, <code>"portuguese"</code>, <code>"romanian"</code>, <code>"russian"</code>, <code>"spanish"</code>, <code>"swedish"</code>, <code>"tamil"</code>, <code>"turkish"</code></p></td>
   </tr>
</table>

ステマーフィルターはトークナイザーによって生成された用語に基づいて動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、「[トークナイザーリファレンス](./analyzer-tokenizers)」を参照してください。

`analyzer_params`を定義した後、コレクションスキーマを定義する際にVARCHARフィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、「[アナライザの概要](./analyzer-overview)」を参照してください。

## 出力の例{#example-output}

以下は、ステマーフィルターがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"running runs looked ran runner"
```

**予想される出力**（`language: "english"`）:

```python
["run", "run", "look", "ran", "runner"]
```

