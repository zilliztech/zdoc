---
title: "デコンパウンダー | BYOC"
slug: /decompounder-filter
sidebar_label: "デコンパウンダー"
beta: PUBLIC
notebook: FALSE
description: "デコンパウンダーフィルター（decompounder）は、指定された辞書に基づいて複合語を個々のコンポーネントに分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語など、複合語を頻繁に使用する言語に特に役立ちます。 | BYOC"
type: origin
token: RN7uwLq2piu9glka6vlcHditnIh
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - decompounder
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# デコンパウンダー

デコンパウンダーフィルター（decompounder）は、指定された辞書に基づいて複合語を個々のコンポーネントに分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語など、複合語を頻繁に使用する言語に特に役立ちます。

## コンフィギュレーション{#configuration}

デコンパウンダーフィルターフィルタは、Zilliz Cloudのカスタムフィルタです。使用するには、フィルタ設定で`"type":"decompounder"`を指定し、認識する単語の辞書を提供する`word_list`パラメータを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
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
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>
</Tabs>

デコンパウンダーフィルターフィルタは、次の設定可能なパラメータを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>word_list</code></p></td>
     <td><p>複合語を分割するために使用される単語構成要素のリスト。この辞書は、複合語が個々の用語に分解される方法を決定します。</p></td>
   </tr>
</table>

トークナイザーによって生成された用語に基づいて`デコンパウンダー`フィルターが動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、「[トークナイザーリファレンス](./analyzer-tokenizers)」を参照してください。

検`光子_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用することができます。これにより、Zilliz Cloudは、指定されたアナライザを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細は、[使用例](./analyzer-overview#example-use)を参照してください。

## 出力の例{#}

以下は、`decompoun der`フィルタがテキストを処理する方法の例です。

**オリジナルテキスト**:

```python
"dampfschifffahrt brotbackautomat"
```

**期待される出力**（`word_list:["damf","schiff","fahrt","brot","backen","automat"]`）:

```python
["dampf", "schiff", "fahrt", "brotbackautomat"]
```

