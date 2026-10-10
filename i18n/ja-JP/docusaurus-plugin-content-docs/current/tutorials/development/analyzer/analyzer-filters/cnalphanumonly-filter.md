---
title: "Cnalphanumonly | Cloud"
slug: /cnalphanumonly-filter
sidebar_label: "Cnalphanumonly"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`cnalphanumonly` フィルターは、中国語文字、英字、数字以外の文字を含むトークンを削除します。 | Cloud"
type: origin
token: R3r7wFHUbi8KxUk2t2FcUXoJnic
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cnalphanumonly

`cnalphanumonly` フィルターは、中国語文字、英字、数字以外の文字を含むトークンを削除します。

## 設定\{#configuration}

`cnalphanumonly` フィルターは Zilliz Cloud に組み込まれています。使用するには、`analyzer_params` 内の `filter` セクションでその名前を指定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"],
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

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba", "filter": []any{"cnalphanumonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({"tokenizer": "jieba", "filter": ["cnalphanumonly"]});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"cnalphanumonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"],
};
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

`cnalphanumonly` フィルターはトークナイザーによって生成された語句に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[Jieba](./jieba-tokenizer) および関連ページを参照してください。

`analyzer_params` を定義した後は、コレクションスキーマを定義する際にそれらを `VARCHAR` フィールドへ適用できます。これにより、Zilliz Cloud は効率的なトークン化とフィルタリングのために、そのフィールド内のテキストを指定されたアナライザーを使用して処理できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザーの設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"],
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

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba", "filter": []any{"cnalphanumonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({"tokenizer": "jieba", "filter": ["cnalphanumonly"]});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"cnalphanumonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"],
};
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

### `run_analyzer` による検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sample text to analyze
sample_text = "Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"

# Run the jieba tokenizer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

let sample_text = "Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。";
client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts([sample_text])
            .analyzer_params(analyzer_params.clone())
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
});

// Sample text to analyze
const sample_text = "Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。";

// Run the jieba tokenizer with the defined configuration
const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params: analyzer_params
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export SAMPLE_TEXT="Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -d '{
    "text": ["'"${SAMPLE_TEXT}"'"],
    "analyzerParams": "{\"tokenizer\":\"jieba\",\"filter\":[\"cnalphanumonly\"]}"
  }' 
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['Milvus', '是', 'LF', 'AI', 'Data', 'Foundation', '下', '的', '一个', '开源', '项目', '以', 'Apache', '2.0', '许可', '发布']
```

