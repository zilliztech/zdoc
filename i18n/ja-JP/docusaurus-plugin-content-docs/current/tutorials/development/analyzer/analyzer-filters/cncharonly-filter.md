---
title: "Cncharonly | Cloud"
slug: /cncharonly-filter
sidebar_label: "Cncharonly"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`cncharonly` フィルターは、中国語以外の文字を含むトークンを削除します。このフィルターは、中国語のテキストのみに注目し、他の文字体系、数字、記号を含むトークンを除外したい場合に便利です。 | Cloud"
type: origin
token: X16rw3C4giUT6bkPLXAcsBapnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cncharonly

`cncharonly` フィルターは、中国語以外の文字を含むトークンを削除します。このフィルターは、中国語のテキストのみに注目し、他の文字体系、数字、記号を含むトークンを除外したい場合に便利です。

## 設定\{#configuration}

`cncharonly` フィルターは Zilliz Cloud に組み込まれています。使用するには、`analyzer_params` 内の `filter` セクションでその名前を指定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cncharonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("cncharonly"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba", "filter": []any{"cncharonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let analyzer_params = serde_json::json!({
        "tokenizer": "jieba",
        "filter": ["cncharonly"]
    });

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"cncharonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cncharonly"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    "cncharonly"
  ]
}'
```

</TabItem>
</Tabs>

`cncharonly` フィルターはトークナイザーが生成した用語を処理するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[Jieba](./jieba-tokenizer) とその関連ページを参照してください。

`analyzer_params` を定義した後は、コレクションスキーマを定義する際に `VARCHAR` フィールドへ適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細は、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cncharonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("cncharonly"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba", "filter": []any{"cncharonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
    let analyzer_params = serde_json::json!({
        "tokenizer": "jieba",
        "filter": ["cncharonly"]
    });
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"cncharonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: "jieba",
  filter: ["cncharonly"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    "cncharonly"
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import java.util.ArrayList;
import java.util.List;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
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
    "encoding/json"
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

bs, _ := json.Marshal(analyzerParams)
texts := []string{"Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParamsStr(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let resp = client.run_analyzer(RunAnalyzerRequest::builder()
        .texts(vec!["Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"])
        .analyzer_params(analyzer_params)
        .build()?).await?;
    println!("{:?}", resp.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
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
const analyzer_params = {
  tokenizer: "jieba",
  filter: ["cncharonly"],
};

const result = await client.runAnalyzer({
  text: "Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。",
  analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
  "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [\"cncharonly\"]}",
  "text": ["Milvus 是 LF AI & Data Foundation 下的一个开源项目，以 Apache 2.0 许可发布。"]
}'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['是', '下', '的', '一个', '开源', '项目', '以', '许可', '发布']
```
