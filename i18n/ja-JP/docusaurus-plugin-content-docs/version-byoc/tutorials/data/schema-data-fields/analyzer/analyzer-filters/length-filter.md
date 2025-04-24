---
title: "長さフィルター | BYOC"
slug: /length-filter
sidebar_label: "長さフィルター"
beta: FALSE
notebook: FALSE
description: "長さフィルター（length）は、指定された`長さ` の要件を満たさないトークンを削除するため、テキスト処理中に保持されるトークンの長さを制御できます。 | BYOC"
type: origin
token: V57dw2T0Gix1zMkNIzncUyMQnKd
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - length
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 長さフィルター

長さフィルター（length）は、指定された`長さ` の要件を満たさないトークンを削除するため、テキスト処理中に保持されるトークンの長さを制御できます。

## コンフィギュレーション{#configuration}

この長さフィルタは、Zilliz Cloudにあるカスタムフィルタで、フィルタ設定で`"type":"length"`を設定することで指定できます。長さの制限を定義するために、`analyzer_params`内で辞書として設定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # Specifies the filter type as length
        "max": 10, # Sets the maximum token length to 10 characters
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
    Collections.singletonList(new HashMap<String, Object>() {{
        put("type", "length");
        put("max", 10);
}}));
```

</TabItem>
</Tabs>

この長さフィルタは、以下の設定可能なパラメータを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>max</code></p></td>
     <td><p>トークンの最大長を設定します。この長さより長いトークンは削除されます。</p></td>
   </tr>
</table>

トークナイザーによって生成された用語に対して長さフィルターが動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、「[トークナイザーリファレンス](./analyzer-tokenizers)」を参照してください。

`analyzer_params`を定義した後、コレクションスキーマを定義する際にVARCHARフィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#example-output}

以下は、`長さ`フィルタがテキストを処理する方法の例です。

**テキストの例**:

```python
"The length filter allows control over token length requirements for text processing."
```

**予想される出力**（`max: 10`）:

```python
["length", "filter", "allows", "control", "over", "token", "length", "for", "text"]
```

