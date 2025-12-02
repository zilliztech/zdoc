---
title: "Stemmer | Cloud"
slug: /stemmer-filter
sidebar_label: "Stemmer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`stemmer` フィルターは、語を基本形または語幹（ステミング）に変換し、異なる語形変化を持つ同様の意味の語を一致させやすくします。`stemmer` フィルターは複数の言語をサポートし、さまざまな言語的コンテキストでの効果的な検索とインデックス作成を可能にします。| Cloud"
type: origin
token: JksSwTwJPidjsnk18Olc2TjWnZe
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
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stemmer

`stemmer` フィルターは、語を基本形または語幹（ステミング）に変換し、異なる語形変化を持つ同様の意味の語を一致させやすくします。`stemmer` フィルターは複数の言語をサポートし、さまざまな言語的コンテキストでの効果的な検索とインデックス作成を可能にします。

## 設定\{#configuration}

`stemmer` フィルターは Zilliz Cloud のカスタムフィルターです。使用するには、フィルター設定で `"type": "stemmer"` を指定し、語幹化に使用する言語を選択する `language` パラメータを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # フィルターの種類を stemmer として指定します
        "language": "english", # ステミングの言語を英語に設定します
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", // フィルターの種類を stemmer として指定します
        "language": "english",
    }],
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":     "stemmer",
        "language": "english",
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stemmer",
      "language": "english"
    }
  ]
}'

```

</TabItem>
</Tabs>

`stemmer` フィルターは、以下の設定可能なパラメータを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>language</code></p></td>
     <td><p>ステミング処理に使用する言語を指定します。サポートされる言語には以下のものがあります: <code>"arabic"</code>, <code>"danish"</code>, <code>"dutch"</code>, <code>"english"</code>, <code>"finnish"</code>, <code>"french"</code>, <code>"german"</code>, <code>"greek"</code>, <code>"hungarian"</code>, <code>"italian"</code>, <code>"norwegian"</code>, <code>"portuguese"</code>, <code>"romanian"</code>, <code>"russian"</code>, <code>"spanish"</code>, <code>"swedish"</code>, <code>"tamil"</code>, <code>"turkish"</code></p></td>
   </tr>
</table>

`stemmer` フィルターは、トークナイザーによって生成された語句に対して操作を行うため、トークナイザーと組み合わせて使用する必要があります。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用して、そのフィールド内のテキストを効率的にトークナイズおよびフィルタリングできます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー設定を適用する前に、`run_analyzer` メソッドを使用してその動作を検証してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # フィルターの種類を stemmer として指定します
        "language": "english", # ステミングの言語を英語に設定します
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

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":     "stemmer",
        "language": "english",
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stemmer",
      "language": "english"
    }
  ]
}'

```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# アナライズするサンプルテキスト
sample_text = "running runs looked ran runner"

# 定義された設定で標準アナライザーを実行
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("running runs looked ran runner");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"running runs looked ran runner"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
未サポートです
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['run', 'run', 'look', 'ran', 'runner']
```