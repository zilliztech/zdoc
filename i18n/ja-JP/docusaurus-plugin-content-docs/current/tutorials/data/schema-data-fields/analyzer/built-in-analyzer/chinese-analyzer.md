---
title: "Chinese | Cloud"
slug: /chinese-analyzer
sidebar_label: "Chinese"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`chinese` アナライザーは中国語テキストを処理するために特別に設計されており、効果的なセグメンテーションとトークナイズを提供します。| Cloud"
type: origin
token: Of8PwuunCihBfxksNJJcSCRYnsf
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - chinese analyzer
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chinese

`chinese` アナライザーは中国語テキストを処理するために特別に設計されており、効果的なセグメンテーションとトークナイズを提供します。

### 定義\{#definition}

`chinese` アナライザーは以下の要素で構成されます：

- **Tokenizer**: `jieba` トークナイザーを使用して、語彙とコンテキストに基づいて中国語テキストをトークンにセグメント化します。詳細については、[Jieba](./jieba-tokenizer) を参照してください。

- **Filter**: `cnalphanumonly` フィルターを使用して、非中国語文字を含むトークンを削除します。詳細については、[Cnalphanumonly](./cnalphanumonly-filter) を参照してください。

`chinese` アナライザーの機能性は、以下のカスタムアナライザー設定と同等です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("cnalphanumonly"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba", "filter": []any{"cnalphanumonly"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    "cnalphanumonly"
  ]
}'

```

</TabItem>
</Tabs>

### 設定\{#configuration}

`chinese` アナライザーをフィールドに適用するには、`analyzer_params` で `type` を `chinese` に設定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "chinese");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "chinese"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "chinese"
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注意">

<p><code>chinese</code> アナライザーは任意のパラメータを受け入れません。</p>

</Admonition>

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "chinese");
```

</TabItem>

<TabItem value='javascript'>

```javascript
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "chinese"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{"type": "chinese"}'
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

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# アナライズするサンプルテキスト
sample_text = "Milvus 是一个高性能、可扩展的向量数据库！"

# 定義された設定で標準アナライザーを実行
result = client.run_analyzer(sample_text, analyzer_params)
print("English analyzer output:", result)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("Milvus 是一个高性能、可扩展的向量数据库！");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-node-sdk";

const sampleText = "Milvus 是一个高性能、可扩展的向量数据库！";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

const result = await client.runAnalyzer({
    ...analyzerParams,
    text: sampleText
});

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
texts := []string{"Milvus 是一个高性能、可扩展的向量数据库！"}
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
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -d '{
    "analyzerParams": "{\"type\": \"chinese\"}",
    "text": ["Milvus 是一个高性能、可扩展的向量数据库！"]
  }'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
Chinese analyzer output: ['Milvus', '是', '一个', '高性', '性能', '高性能', '可', '扩展', '的', '向量', '数据', '据库', '数据库']
```

