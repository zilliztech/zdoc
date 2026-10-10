---
title: "Standard トークナイザー | Cloud"
slug: /standard-tokenizer
sidebar_label: "Standard"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の `standard` トークナイザーは、連続する Unicode の文字と数字を 1つのトークンにまとめ、その他の文字で分割します。 | Cloud"
type: origin
token: GAX8wkC1QiTZhXkLBocc1GoTnke
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard トークナイザー

Zilliz Cloud の `standard` トークナイザーは、連続する Unicode の文字と数字を 1つのトークンにまとめ、その他の文字で分割します。

## トークン化のルール\{#tokenization-rules}

`standard` トークナイザーは、次のセットに属する連続した文字を同じトークンに保持します。

- **ASCII 文字:** 英字 `A-Z` と `a-z`、および数字 `0-9`。

- **非 ASCII 文字:** Unicode の `Alphabetic` プロパティ、または数値の一般カテゴリ `Nd`、`Nl`、`No` のいずれかを持つ文字。

| Unicode のプロパティまたはカテゴリ | 意味 | トークンに保持される文字の例 |
| --- | --- | --- |
| `Alphabetic` | 中国語の文字や日本語のかな、一部の結合マークを含む、さまざまな表記体系の文字 | `中文测试`, `カタカナ` |
| `Nd`（`Decimal_Number`） | 10 進数字 | `٣` |
| `Nl`（`Letter_Number`） | 文字に似た数値文字 | `Ⅷ` |
| `No`（`Other_Number`） | 丸囲み数字、上付き文字、分数などのその他の数値文字 | `①²¾` |

これらのセットに含まれない文字はトークンを区切り、破棄されます。これには空白、句読点、アンダースコア（`_`）、ハイフン（`-`）、アポストロフィ（`'`）、および `+`、`$`、`😀` などの記号が含まれます。連続する区切り文字は空のトークンを生成しません。

文字の分類は Rust の [`char::is_alphanumeric()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_alphanumeric) に従います。プロパティの定義については、[Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/) を参照してください。Unicode 17.0 の完全な文字リストは、`Alphabetic` には [`DerivedCoreProperties.txt`](https://www.unicode.org/Public/17.0.0/ucd/DerivedCoreProperties.txt)、`Nd`、`Nl`、`No` には [`DerivedGeneralCategory.txt`](https://www.unicode.org/Public/17.0.0/ucd/extracted/DerivedGeneralCategory.txt) で入手できます。文字がどの集合に属するかは、デプロイされたバージョンで使用される Unicode データによって異なります。

次の例では、`{"tokenizer": "standard"}` をフィルターなしで使用します。トークナイザーは文字の大文字と小文字を保持し、連続する中国語テキストを個々の単語に分割しません。

| 入力 | 出力トークン |
| --- | --- |
| `foo_bar-can't😀123` | `["foo", "bar", "can", "t", "123"]` |
| `中文测试` | `["中文测试"]` |
| `version①.¾` | `["version①", "¾"]` |
| `Hello,World!` | `["Hello", "World"]` |

## 設定\{#configuration}

`standard` トークナイザーを使用するアナライザーを設定するには、`analyzer_params` で `tokenizer` を `standard` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

analyzerParams.put("tokenizer", "standard");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard"
}'
```

</TabItem>
</Tabs>

`standard` トークナイザーは、1つ以上のフィルターと組み合わせて使用できます。たとえば、次のコードは `standard` トークナイザーと `lowercase` フィルターを使用するアナライザーを定義しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

analyzerParams.put("tokenizer", "standard");

analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["lowercase"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

より簡単に設定するには、`standard` トークナイザーと [`lowercase`](./lowercase-filter)[ フィルター](./lowercase-filter) を組み合わせた [`standard`](./standard-analyzer) [アナライザー](./standard-analyzer) を使用することもできます。

</Admonition>

`analyzer_params` を定義した後、コレクションスキーマを定義する際にそれらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使ってその動作を確認してください。

### アナライザーの設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

analyzerParams.put("tokenizer", "standard");

analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["lowercase"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful

analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使った検証\{#verification-using-runanalyzer}

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
sample_text = "The Milvus vector database is built for scale!"

# Run the standard analyzer with the defined configuration
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
import java.util.ArrayList;
import java.util.List;

ConnectConfig config = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .token("YOUR_CLUSTER_TOKEN")

        .build();

MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();

texts.add("The Milvus vector database is built for scale!");

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

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})

if err != nil {
    fmt.Println(err.Error())

    // handle error
}

texts := []string{"The Milvus vector database is built for scale!"}

option := milvusclient.NewRunAnalyzerOption(texts...).

    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)

if err != nil {
    fmt.Println(err.Error())

    // handle error
}

fmt.Println(result)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");

let client = ClientV2::new(&config).await?;

let sample_text = "The Milvus vector database is built for scale!";

let result = client

    .run_analyzer(

        RunAnalyzerRequest::builder()

            .texts(vec![sample_text])

            .analyzer_params(analyzer_params)

            .build()?,
    )

    .await?;

println!("Standard analyzer output: {:?}", result);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "The Milvus vector database is built for scale!";
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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const sampleText = "The Milvus vector database is built for scale!";

const result = await client.runAnalyzer({
    text: sampleText,
    analyzer_params,
});

console.log("Standard analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \

--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \

--header "Authorization: Bearer ${TOKEN}" \

--header "Content-Type: application/json" \

--header "Request-Timeout: 10" \

-d '{
    "text": ["The Milvus vector database is built for scale!"],
    "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [\"lowercase\"]}"
}'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```sql
['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

