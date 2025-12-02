---
title: "Standard Analyzer | Cloud"
slug: /standard-analyzer
sidebar_label: "Standard Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`standard` アナライザーは、Zilliz Cloud のデフォルトアナライザーであり、アナライザーが指定されていない場合にテキストフィールドに自動的に適用されます。文法ベースのトークナイズを使用しているため、ほとんどの言語に効果的です。| Cloud"
type: origin
token: WMSvwXXz4iR7mZkGmUscF3Y1nxs
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - standard-analyzer
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard Analyzer

`standard` アナライザーは、Zilliz Cloud のデフォルトアナライザーであり、アナライザーが指定されていない場合にテキストフィールドに自動的に適用されます。文法ベースのトークナイズを使用しているため、ほとんどの言語に効果的です。

<Admonition type="info" icon="📘" title="注意">

<p><code>standard</code> アナライザーは、単語境界に区切り文字（スペース、句読点など）に依存する言語に適しています。しかし、中国語、日本語、韓国語などの言語では辞書ベースのトークナイズが必要です。このような場合、<a href="./chinese-analyzer"><code>chinese</code></a> のような言語固有のアナライザーまたは特殊なトークナイザー（<a href="./lindera-tokenizer"><code>lindera</code></a>、<a href="./icu-tokenizer"><code>icu</code></a> など）とフィルター付きのカスタムアナライザーを使用することが、正確なトークナイズとより良い検索結果を確実にするために強く推奨されます。</p>

</Admonition>

## 定義\{#definition}

`standard` アナライザーは以下の要素で構成されます：

- **Tokenizer**: `standard` トークナイザーを使用して、文法ルールに基づいてテキストを離散的な単語単位に分割します。詳細については、[Standard Tokenizer](./standard-tokenizer) を参照してください。

- **Filter**: `lowercase` フィルターを使用して、すべてのトークンを小文字に変換し、大文字小文字を区別しない検索を可能にします。詳細については、[Lowercase](./lowercase-filter) を参照してください。

`standard` アナライザーの機能性は、以下のカスタムアナライザー設定と同等です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
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

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
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

## 設定\{#configuration}

`standard` アナライザーをフィールドに適用するには、`analyzer_params` で `type` を `standard` に設定し、必要に応じてオプションパラメータを含めてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # 標準アナライザーの種類を指定
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // 標準アナライザーの種類を指定
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "standard"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard"
}'
```

</TabItem>
</Tabs>

`standard` アナライザーは以下のオプションパラメータを受け入れます：

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークナイズから削除されるストップワードのリストを含む配列。</p></td>
   </tr>
</table>

カスタムストップワードの設定例：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # 標準アナライザーの種類を指定
    "stop_words", ["of"] # オプション: トークナイズから除外する単語リスト
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("of"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
analyzer_params = {
    "type": "standard", // 標準アナライザーの種類を指定
    "stop_words", ["of"] // オプション: トークナイズから除外する単語リスト
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "standard", "stop_words": []string{"of"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用して、そのフィールド内のテキストを効率的なトークナイズおよびフィルタリングのために処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard",  # 標準アナライザーの設定
    "stop_words": ["for"] # オプション: カスタムストップワードパラメータ
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("for"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "standard", "stop_words": []string{"for"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard",
  "stop_words": [
    "of"
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

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# アナライズするサンプルテキスト
sample_text = "The Milvus vector database is built for scale!"

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
texts := []string{"The Milvus vector database is built for scale!"}
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
Standard analyzer output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'scale']
```

