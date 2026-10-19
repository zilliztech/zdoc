---
title: "タイ語 | BYOC"
slug: /thai-tokenizer
sidebar_label: "タイ語"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` トークナイザーは、スペースに依存せずにタイ語のテキストを単語トークンに分割します。タイ語またはタイ語/English が混在するテキスト用のカスタムアナライザーパイプラインを構築する必要がある場合は、このトークナイザーを使用してください。 | BYOC"
type: origin
token: KT4yw9ZWriYDilkhFR7cr00Znfb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# タイ語

`thai` トークナイザーは、スペースに依存せずにタイ語のテキストを単語トークンに分割します。タイ語またはタイ語/English が混在するテキスト用のカスタムアナライザーパイプラインを構築する必要がある場合は、このトークナイザーを使用してください。

## 設定\{#configuration}

<Admonition type="info" title="Notes">

タイ語のテキストには、ほとんどの場合、組み込みの `thai` アナライザーを使用してください。組み込みアナライザーには、このトークナイザーに加えて、小文字化、10 進数字の正規化、タイ語のストップワードの削除が含まれています。カスタムアナライザーパイプラインを構築する必要がある場合にのみ、`thai` トークナイザーを直接使用してください。詳細については、[タイ語アナライザー](./thai-analyzer) を参照してください。

</Admonition>

`thai` トークナイザーを使用してアナライザーを構成するには、`analyzer_params` で `tokenizer` を `thai` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai"
}'
```

</TabItem>
</Tabs>

`thai` トークナイザーには、構成可能なパラメーターはありません。

トークナイザーは、1 つ以上のフィルターと組み合わせて使用できます。たとえば、次の構成では、`thai` トークナイザーと `lowercase` および `decimaldigit` フィルターを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
    ],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
analyzerParams.put("filter", Arrays.asList("lowercase", "decimaldigit"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "thai", "filter": []any{"lowercase", "decimaldigit"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai",
    "filter": ["lowercase", "decimaldigit"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
    {"filter", {"lowercase", "decimaldigit"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
    "filter": ["lowercase", "decimaldigit"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai",
  "filter": [
    "lowercase",
    "decimaldigit"
  ]
}'
```

</TabItem>
</Tabs>

このカスタムパイプラインは、組み込みの `_thai_` ストップワード辞書を含まないため、組み込みの `thai` アナライザーと同等ではありません。完全な定義済みパイプラインを使用するには、`{"type": "thai"}` を使用してください。

トークナイザーは、次の動作を適用します。

- **タイ語の分割**: 空白に依存せずに、タイ語のテキストを単語トークンに分割します。

- **空白と句読点のフィルタリング**: 空白および句読点のみのセグメントを除外します。これは、句読点とスペースをトークンとして保持できる `icu` トークナイザーとは異なります。

- **混在スクリプトのテキスト**: タイ語/English が混在するテキストでは、ラテン文字の単語トークンを出力します。

- **トークナイザーのみ**: トークンの小文字化、Unicode 数字の正規化、ストップワードの削除は行いません。これらの処理には、フィルターを追加するか、組み込みの `thai` アナライザーを使用してください。

- **位置のセマンティクス**: スキップされた空白と句読点を含む文字ベースのトークン位置を使用します。これにより、フレーズマッチングと近接マッチングの動作が他の非ラテン語トークナイザーと一貫します。

`analyzer_params` を定義した後、コレクションスキーマを定義するときに、アナライザーを `VARCHAR` フィールドに適用できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザーの構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai"
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓");

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

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"}
option := milvusclient.NewRunAnalyzerOption(texts...).
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
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let texts = ["สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓".to_string()];
let analyzer_params = serde_json::json!({
    "tokenizer": "thai"
});

let result = client.run_analyzer(
    RunAnalyzerRequest::builder()
        .texts(texts)
        .analyzer_params(analyzer_params)
        .build()?,
).await?;

println!("{:?}", result.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓";
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
const res = await client.runAnalyzer({
    text: 'สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓',
    analyzer_params: analyzer_params
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "text": ["สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"],
    "analyzerParams": "{\"tokenizer\":\"thai\"}"
  }'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```plaintext
['สวัสดี', 'ทดสอบ', 'ระบบ', 'Milvus', '๑๒๓']
```
