---
title: "Length | BYOC"
slug: /length-filter
sidebar_label: "Length"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`length`フィルターは、指定された長さの要件を満たさないトークンを削除し、テキスト処理中に保持されるトークンの長さを制御できます。| BYOC"
type: origin
token: MKdvwWBDRi5MMAkkn5PcD1x9nfh
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
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Length

`length`フィルターは、指定された長さの要件を満たさないトークンを削除し、テキスト処理中に保持されるトークンの長さを制御できます。

## 構成\{#configuration}

`length`フィルターはZilliz Cloudのカスタムフィルターであり、フィルター構成で`"type": "length"`を設定して指定します。`analyzer_params`内の辞書として構成し、長さの制限を定義できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # フィルターの種類をlengthとして指定します
        "max": 10, # トークンの最大長を10文字に設定します
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

<TabItem value='javascript'>

```javascript
cosnt analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # フィルターの種類をlengthとして指定します
        "max": 10, # トークンの最大長を10文字に設定します
    }],
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
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
      "type": "length",
      "max": 10
    }
  ]
}'

```

</TabItem>
</Tabs>

`length`フィルターは、以下の設定可能なパラメータを受け入れます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>max</code></p></td>
     <td><p>トークンの最大長を設定します。この長さより長いトークンは削除されます。</p></td>
   </tr>
</table>

`length`フィルターは、トークナイザーによって生成された用語に対して操作を行うため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloudで利用可能なトークナイザーのリストについては、[トークナイザー参照](./analyzer-tokenizers)を参照してください。

`analyzer_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用できます。これにより、Zilliz Cloudは、指定されたアナライザーを使用してそのフィールド内のテキストを効率的にトークン化およびフィルタリング処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー構成を適用する前に、`run_analyzer`メソッドを使用してその動作を検証してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # フィルターの種類をlengthとして指定します
        "max": 10, # トークンの最大長を10文字に設定します
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

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### `run_analyzer`を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 解析するサンプルテキスト
sample_text = "The length filter allows control over token length requirements for text processing."

# 定義された構成でstandardアナライザーを実行
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
texts.add("The length filter allows control over token length requirements for text processing.");

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
texts := []string{"The length filter allows control over token length requirements for text processing."}
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
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['The', 'length', 'filter', 'allows', 'control', 'over', 'token', 'length', 'for', 'text', 'processing']
```
