---
title: "Jieba | Cloud"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`jieba` tokenizer は、中国語のテキストを構成する単語に分割して処理します。 | Cloud"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba` tokenizer は、中国語のテキストを構成する単語に分割して処理します。

<Admonition type="info" icon="📘" title="注意">

`jieba` tokenizer は、句読点を出力内で個別の token として保持します。たとえば、`"你好！世界。"` は `["你好", "！", "世界", "。"]` になります。これらの独立した句読点 token を削除するには、[`removepunct`](./remove-punct-filter) filter を使用してください。

</Admonition>

## Configuration\{#configuration}

Milvus は、`jieba` tokenizer に対して 2 つの設定方法をサポートしています。シンプル設定とカスタム設定です。

### Simple configuration\{#simple-configuration}

シンプル設定では、tokenizer を `"jieba"` に設定するだけです。例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Simple configuration: only specifying the tokenizer name
analyzer_params = {
    "tokenizer": "jieba",  # Use the default settings: dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"}
};
```

</TabItem>
</Tabs>

このシンプル設定は、次のカスタム設定と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Custom configuration equivalent to the simple configuration above
analyzer_params = {
    "type": "jieba",          # Tokenizer type, fixed as "jieba"
    "dict": ["_default_"],     # Use the default dictionary
    "mode": "search",          # Use search mode for improved recall (see mode details below)
    "hmm": True                # Enable HMM for probabilistic segmentation
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("_default_"));
analyzerParams.put("mode", "search");
analyzerParams.put("hmm", true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"_default_"}, "mode": "search", "hmm": true}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"dict", {"_default_"}},
    {"mode", "search"},
    {"hmm", true}
};
```

</TabItem>
</Tabs>

パラメーターの詳細については、[Custom configuration](./jieba-tokenizer#custom-configuration) を参照してください。

### Custom configuration\{#custom-configuration}

より細かく制御したい場合は、カスタム設定を指定できます。これにより、カスタム辞書の指定、分割モードの選択、Hidden Markov Model (HMM) の有効化または無効化が可能です。例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Custom configuration with user-defined settings
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # Fixed tokenizer type
        "dict": ["customDictionary"],  # Custom dictionary list; replace with your own terms
        "mode": "exact",           # Use exact mode (non-overlapping tokens)
        "hmm": False               # Disable HMM; unmatched text will be split into individual characters
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");                                                                                                      
  put("dict", Arrays.asList("customDictionary"));             
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type": "jieba",
      "dict": []string{"customDictionary"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzerParams = {                                                                                              
  {"tokenizer", {                          
      {"type", "jieba"},                                                                                                     
      {"dict", {"customDictionary"}},                         
      {"mode", "exact"},                                                                                                     
      {"hmm", false}                                          
  }}
};
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
     <th><p>デフォルト値</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>tokenizer のタイプです。これは <code>"jieba"</code> に固定されています。</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>analyzer が語彙ソースとして読み込む辞書のリストです。組み込みオプション:</p><ul><li><p><code>"_default_"</code>: エンジンの組み込み簡体字中国語辞書を読み込みます。詳細は <a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a> を参照してください。</p></li><li><p><code>"_extend_default_"</code>: <code>"_default_"</code> のすべてに加え、追加の繁体字中国語補助辞書も読み込みます。詳細は <a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a> を参照してください。</p><p>また、組み込み辞書と任意の数のカスタム辞書を組み合わせることもできます。例: <code>["_default_", "结巴分词器"]</code>。</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>分割モードです。指定可能な値:</p><ul><li><p><code>"exact"</code>: 文をできるだけ正確に分割しようとするため、テキスト解析に適しています。</p></li><li><p><code>"search"</code>: exact モードをベースに長い単語をさらに細かく分割して再現率を向上させるため、検索エンジンの tokenization に適しています。</p><p>詳細は <a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a> を参照してください。</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書に見つからない単語の確率的分割に Hidden Markov Model (HMM) を有効にするかどうかを示す boolean フラグです。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

大規模なカスタム語彙を `dict` でインライン指定する代わりに外部ファイルから読み込むには、下記の [Custom configuration with a dictionary file](./jieba-tokenizer#custom-configuration-with-a-dictionary-file) を参照してください。

`analyzer_params` を定義した後は、collection schema を定義するときにそれを `VARCHAR` field に適用できます。これにより、Zilliz Cloud は指定された analyzer を使用してその field 内のテキストを処理し、効率的な tokenization と filtering を行えます。詳細は、[Example use](./analyzer-overview#example-use) を参照してください。

### Custom configuration with a dictionary file | PRIVATE\{#custom-configuration-with-a-dictionary-file}

大規模なカスタム語彙 — ドメイン用語集、製品用語、固有名詞リストなど — には、単語をファイルに保存し、そのファイルをリモートファイルリソースとして登録してから、tokenizer から `extra_dict_file` パラメーター経由で参照してください。analyzer は、これらの単語を組み込み辞書に追加する形で語彙に読み込みます。

ファイルは UTF‑8 のプレーンテキストで、1 行に 1 つの用語を記述します。例:

```plaintext
结巴分词器
向量数据库
```

ファイルを Milvus cluster が使用するよう設定されている object store にアップロードしてから、登録します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the uploaded file under a name you'll reference from analyzer configs.
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",    # full S3 object key, including the rootPath prefix
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

`extra_dict_file` を介して tokenizer 内で登録済みリソースを参照します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],             # keep the built-in dictionary
        "mode": "exact",
        "hmm": False,
        "extra_dict_file": {
            "type": "remote",
            "resource_name": "zh_terms",
            "file_name": "zh_terms.txt",
        },
    },
}

client.run_analyzer(["milvus结巴分词器中文测试"], analyzer_params)
# → [['milvus', '结巴', '分词器', '中文', '测试']]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

`extra_dict_file` パラメーターは、次のフィールドを持つオブジェクトを受け取ります。

| Field | Description |
| --- | --- |
| `type` | リソースタイプです。`add_file_resource` で登録したファイルには `"remote"` を使用します。self-hosted デプロイメントで使用される `"local"` バリアントについては、[Manage File Resources](./manage-file-resources) を参照してください。 |
| `resource_name` | ファイルを `add_file_resource` で登録したときに使用した名前です。 |
| `file_name` | 登録済みリソースの object-store path のファイル名部分です（たとえば、リソースが `path="file/zh_terms.txt"` で登録されていた場合は `"zh_terms.txt"`）。 |

`extra_dict_file` 経由で追加された単語は組み込み辞書とマージされるため、jieba の分割アルゴリズムは既存エントリと並んでそれらを認識します。特定の用語が単独の token として出力されるかどうかは、jieba の確率重み付き DAG 選択に依存します。たとえば、`向量数据库` のような長いカスタム用語でも、組み込み辞書内でより短いエントリの頻度が高ければ、`向量` + `数据库` に分割される場合があります。

## Examples\{#examples}

analyzer 設定を collection schema に適用する前に、`run_analyzer` メソッドを使ってその動作を検証してください。

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");                                                                                                      
  put("dict", Arrays.asList("结巴分词器"));                   
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type": "jieba",
      "dict": []string{"结巴分词器"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzerParams = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"结巴分词器"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>
</Tabs>

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
sample_text = "milvus结巴分词器中文测试"

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

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("milvus结巴分词器中文测试");

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
texts := []string{"milvus结巴分词器中文测试"}
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "milvus结巴分词器中文测试";
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
</Tabs>

### 期待される出力\{#expected-output}

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```

