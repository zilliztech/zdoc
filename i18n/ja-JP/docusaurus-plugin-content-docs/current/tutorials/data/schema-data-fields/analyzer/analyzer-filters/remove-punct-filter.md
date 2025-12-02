---
title: "Remove Punct | Cloud"
slug: /remove-punct-filter
sidebar_label: "Remove Punct"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`removepunct` フィルターは、トークンストリームから独立した句読点トークンを削除します。句読点マークではなく意味のある内容語に焦点を当てたクリーンなテキスト処理が必要な場合に使用してください。| Cloud"
type: origin
token: TVfnwtCEQico7Bk9bngcnV1cnGb
sidebar_position: 10
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - remove punct
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Remove Punct

`removepunct` フィルターは、トークンストリームから独立した句読点トークンを削除します。句読点マークではなく意味のある内容語に焦点を当てたクリーンなテキスト処理が必要な場合に使用してください。

<Admonition type="info" icon="📘" title="注意">

<p>このフィルターは、句読点を個別のトークンとして保持する <code>jieba</code>、<code>lindera</code>、および <code>icu</code> トークナイザーと組み合わせて使用する場合に最も効果的です（例: <code>"Hello!"</code> → <code>["Hello", "!"]</code>）。<code>standard</code> や <code>whitespace</code> のような他のトークナイザーはトークナイズ時に句読点を破棄するため、<code>removepunct</code> はこれらには効果がありません。</p>

</Admonition>

## 設定\{#configuration}

`removepunct` フィルターは Zilliz Cloud に組み込まれています。使用するには、`analyzer_params` 内の `filter` セクションにその名前を指定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba", "filter": []any{"removepunct"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

`removepunct` フィルターは、トークナイザーによって生成された語句に対して操作を行うため、トークナイザーと組み合わせて使用する必要があります。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用して、そのフィールド内のテキストを効率的にトークナイズおよびフィルタリングできます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー設定を適用する前に、`run_analyzer` メソッドを使用してその動作を検証してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu", "filter": []string{"removepunct"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
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
sample_text = "Привет! Как дела?"

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
texts.add("Привет! Как дела?");

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
texts := []string{"Привет! Как дела?"}
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

```plaintext
['Привет', 'Как', 'дела']
```