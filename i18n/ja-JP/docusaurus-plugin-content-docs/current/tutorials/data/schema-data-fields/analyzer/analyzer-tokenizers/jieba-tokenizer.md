---
title: "Jieba | Cloud"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`jieba` トークナイザーは中国語のテキストを構成単語に分割して処理します。| Cloud"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - jieba-tokenizer
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba` トークナイザーは中国語のテキストを構成単語に分割して処理します。

<Admonition type="info" icon="📘" title="注意">

<p><code>jieba</code> トークナイザーは、句読点を出力では個別のトークンとして保持します。たとえば、<code>"你好！世界。"</code> は <code>["你好", "！", "世界", "。"]</code> になります。これらの独立した句読点トークンを削除するには、<a href="./remove-punct-filter"><code>removepunct</code></a> フィルターを使用してください。</p>

</Admonition>

## 設定\{#configuration}

Milvus は `jieba` トークナイザーに2つの設定方法をサポートしています：簡易設定とカスタム設定です。

### 簡易設定\{#simple-configuration}

簡易設定では、トークナイザーを `"jieba"` に設定するだけで済みます。たとえば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 簡易設定: トークナイザー名のみを指定
analyzer_params = {
    "tokenizer": "jieba",  # デフォルト設定を使用: dict=["_default_"], mode="search", hmm=True
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
</Tabs>

この簡易設定は、以下のカスタム設定と同等です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 上記の簡易設定と同等のカスタム設定
analyzer_params = {
    "type": "jieba",          # トークナイザーの種類、"jieba" に固定
    "dict": ["_default_"],     # デフォルト辞書を使用
    "mode": "search",          # 検索モードを使用して検索性を向上 (下記のモード詳細を参照)
    "hmm": True                # 確率的セグメンテーション用に HMM を有効化
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
</Tabs>

パラメータの詳細については、[カスタム設定](./jieba-tokenizer#custom-configuration)を参照してください。

### カスタム設定\{#custom-configuration}

より細かい制御のために、カスタム辞書を指定し、セグメンテーションモードを選択し、隠れマルコフモデル (HMM) を有効化または無効化できるカスタム設定を提供できます。たとえば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ユーザー定義設定のカスタム設定
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # 固定のトークナイザー種類
        "dict": ["customDictionary"],  # カスタム辞書リスト; 自分の用語に置き換えてください
        "mode": "exact",           # exact モードを使用 (重複しないトークン)
        "hmm": False               # HMM を無効化; 一致しないテキストは個別の文字に分割されます
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("customDictionary"));
analyzerParams.put("mode", "exact");
analyzerParams.put("hmm", false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"customDictionary"}, "mode": "exact", "hmm": false}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>デフォルト値</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーの種類。これは <code>"jieba"</code> に固定されています。</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>アナライザーが語彙源として読み込む辞書のリスト。組み込みオプション：</p><ul><li><p><code>"_default_"</code>: エンジンの組み込み中国語簡体字辞書を読み込みます。詳細については、<a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a> を参照してください。</p></li><li><p><code>"_extend_default_"</code>: <code>"_default_"</code> のすべてに加えて、中国語繁体字補足辞書を追加で読み込みます。詳細については、<a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a> を参照してください。</p><p>組み込み辞書と任意の数のカスタム辞書を組み合わせることもできます。例：<code>["_default_", "结巴分词器"]</code>。</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>セグメンテーションモード。指定可能な値：</p><ul><li><p><code>"exact"</code>: 文を最も正確な方法でセグメント化しようと試み、テキスト分析に最適です。</p></li><li><p><code>"search"</code>: exact モードを基盤として、検索性向上のために長単語をさらに分解し、検索エンジンのトークナイズに適しています。</p><p>詳細については、<a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a> を参照してください。</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書にない単語の確率的セグメンテーション用に隠れマルコフモデル (HMM) を有効にするかどうかを示すブールフラグ。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用して、そのフィールド内のテキストを効率的なトークナイズおよびフィルタリングのために処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("结巴分词器"));
analyzerParams.put("mode", "exact");
analyzerParams.put("hmm", false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"结巴分词器"}, "mode": "exact", "hmm": false}
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

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# アナライズするサンプルテキスト
sample_text = "milvus结巴分词器中文测试"

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
</Tabs>

### 期待される出力\{#expected-output}

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```
