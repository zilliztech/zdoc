---
title: "パターンマッチング | Cloud"
slug: /pattern-match
sidebar_label: "パターンマッチング"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エージェント検索アプリケーションでは、ベクトル検索と grep 形式のパターンマッチングがしばしば補完関係にあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子など、正確な文字列構造によって結果を絞り込みます。 | Cloud"
type: origin
token: PFbNwB7Mli18n6k6VWScGcpWndc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パターンマッチング

エージェント検索アプリケーションでは、ベクトル検索と grep 形式のパターンマッチングがしばしば補完関係にあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子など、正確な文字列構造によって結果を絞り込みます。

Zilliz Cloud では、これらのパターン制約をスカラーフィルターで表現できます。単純なワイルドカードマッチングには `LIKE` を使用し、[RE2](https://github.com/google/re2/wiki/syntax) 正規表現には `=~` または `!~` を使用します。これらのフィルターは、`query`、`search`、ハイブリッド検索と組み合わせることができます。

<Admonition type="info" title="Note">

このページでは、query、search、ハイブリッド検索で使用されるスカラーフィルター式におけるパターンマッチングについて説明します。これらの式はフィールド値を評価するものであり、アナライザーが生成するトークンを変更するものではありません。テキスト分析中にトークンをフィルタリングするには、[Regex Analyzer Filter](./regex-filter) を参照してください。

</Admonition>

パターンマッチング式は `filter` パラメーターに記述します。たとえば、次のクエリは `E1001` などのエラーコードを含むログメッセージに一致します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

res = client.query(
    collection_name="log_events",
    # highlight-next-line
    filter='message =~ "E[0-9]{4}"',
    output_fields=["message", "severity"],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

QueryResp res = client.query(QueryReq.builder()
        .collectionName("log_events")
        // highlight-next-line
        .filter("message =~ \"E[0-9]{4}\"")
        .outputFields(Arrays.asList("message", "severity"))
        .build());
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
})
if err != nil {
    // handle error
}
defer client.Close(ctx)

res, err := client.Query(ctx, milvusclient.NewQueryOption("log_events").
    // highlight-next-line
    WithFilter(`message =~ "E[0-9]{4}"`).
    WithOutputFields("message", "severity"))
if err != nil {
    // handle error
}
fmt.Println(res)
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

async function main() {
  const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

  const res = await client.query({
    collection_name: 'log_events',
    // highlight-next-line
    filter: 'message =~ "E[0-9]{4}"',
    output_fields: ['message', 'severity'],
  });
  console.log(res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

QueryResp res = await client.QueryAsync(new QueryReq
{
    CollectionName = "log_events",
    Expression = "message =~ \"E[0-9]{4}\"",
    Parameters = new QueryParameters
    {
        OutputFields = { "message", "severity" }
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "log_events",
    "filter": "message =~ \"E[0-9]{4}\"",
    "outputFields": ["message", "severity"]
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message =~ "E[0-9]{4}"' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

このページの例では、`filter` に割り当てられた式に焦点を当てます。同じフィルター式構文は、`query`、`search`、ハイブリッド検索など、スカラーフィルターを受け入れる Zilliz Cloud の操作で使用できます。

<Admonition type="info" title="Notes">

フィルター式の左辺のリテラルには、以下の例で使用されている `message`、`email` などのコレクションフィールド名、または `filter = 'struct[0][subfield] =~ "E[0-9]{4}"'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## サポートされるフィールド型\{#supported-field-types}

パターンマッチングは文字列値で使用できます。

| 対象 | `LIKE` | 正規表現 `=&#126;` / `!&#126;` | 注記 |
| --- | --- | --- | --- |
| `VARCHAR` フィールド | はい | はい | 文字列フィールドのパターンマッチングの一般的な対象です。 |
| `VARCHAR` キャスト型の `JSON` パス | はい | はい | 正の一致を得るには、JSON パスの値が文字列である必要があります。高速化のために JSON パスにインデックスを作成する場合は、`json_cast_type="varchar"` を設定します。 |
| `ARRAY<VARCHAR>` 要素 | はい | はい | `tags[0]` など、インデックスで特定の要素を照合します。パターンマッチングはすべての要素をスキャンするのではなく、指定されたインデックスの要素にのみ適用されます。 |
| 数値、Boolean、ベクトル、`TEXT`、その他の非 `VARCHAR` 対象 | いいえ | いいえ | パターンマッチングは、`VARCHAR` 値、文字列に解決される JSON パス、またはインデックス付きの `ARRAY<VARCHAR>` 要素でのみ使用できます。 |

## LIKE または正規表現を選択する\{#choose-like-or-regex}

必要なパターンを表現する最も単純な演算子を選択してください。

文字列の完全一致が必要な場合は、パターンマッチングではなく `==` を使用することをお勧めします。`LIKE` または正規表現は、フィルターでパターンを照合する必要がある場合にのみ使用してください。

| 要件 | 推奨される演算子 | 例 | 説明 |
| --- | --- | --- | --- |
| 文字列の完全一致 | `==` | `status == "active"` | 文字列 `active` の完全一致です。 |
| 単純なプレフィックス一致 | `LIKE` | `name LIKE "Prod%"` | `Prod` で始まる文字列に一致します。 |
| 単純なサフィックス一致 | `LIKE` | `filename LIKE "%.json"` | `.json` で終わる文字列に一致します。 |
| 単純な部分一致 | `LIKE` | `description LIKE "%vector database%"` | 文字列内の任意の位置に `vector database` を含む値に一致します。 |
| 構造化されたコードまたは固定長パターンの一致 | `=&#126;` | `code =&#126; "E[0-9]{4}"` | `E1001` など、`E` の後に 4 桁の数字が続く文字列に大文字と小文字を区別して一致します。 |
| 大文字と小文字を区別しないパターンマッチング | `(?i)` を指定した `=&#126;` | `message =&#126; "(?i)error"` | `error`、`ERROR`、その他の大文字と小文字のバリエーションに一致します。 |
| 正規表現パターンに一致する値を除外する | `!&#126;` | `message !&#126; "^DEBUG"` | `DEBUG` で始まる文字列を除外します。 |

単純なワイルドカードマッチングには `LIKE` を使用します。パターンに文字クラス、繰り返し、`error|failed` などの選択、アンカー、大文字と小文字を区別しないマッチングが必要な場合は、正規表現を使用します。

## LIKE を使用する\{#use-like}

`LIKE` 演算子は、文字列値に対する単純なワイルドカードマッチング用です。次のワイルドカードのみをサポートします：

| ワイルドカード | 説明 |
| --- | --- |
| `%` | 0 文字以上の文字に一致します。 |
| `_` | 正確に 1 文字に一致します。 |

### 一般的な LIKE パターン\{#common-like-patterns}

一致した文字列内で固定テキストが表示される位置を制御するには、`%` と `_` の位置を使用します。

| 要件 | パターン | フィルターの例 |
| --- | --- | --- |
| プレフィックスで始まる | `Prod%` | `filter = 'name LIKE "Prod%"'` |
| サフィックスで終わる | `%.json` | `filter = 'filename LIKE "%.json"'` |
| 部分文字列を含む | `%vector%` | `filter = 'description LIKE "%vector%"'` |
| 固定位置の 1 文字に一致する | `AB_%` | `filter = 'code LIKE "AB_%"'` |

### LIKE のマッチング動作\{#like-matching-behavior}

プレフィックス、サフィックス、部分一致、固定位置の 1 文字の一致には `LIKE` を使用します。`LIKE` は、`[0-9]` などの文字クラス、`error|failed` などの選択、`{4}` などの繰り返し回数、`^` や `$` などのアンカー、`(?i)` などの大文字と小文字を区別しないフラグをサポートしていません。これらのパターンには正規表現を使用します。

文字列全体の完全一致には `==` を使用します。`LIKE` は、フィルターでワイルドカードマッチングが必要な場合にのみ使用してください。

### LIKE パターンでのワイルドカードのエスケープ\{#escaping-wildcards-in-a-like-pattern}

`LIKE` パターンでは、`%` は任意の数の文字に一致し、`_` は 1 文字に一致します。`%`、`_`、`\` をリテラルとして一致させるには、文字をバックスラッシュ（`\`）でエスケープします：

- `name LIKE r"\%"` は、リテラル値 `%` に一致します。

- `name LIKE r"\_%"` は、リテラル `_` で始まる値に一致します。

- `name LIKE r"\\%"` は、リテラルのバックスラッシュで始まる値に一致します。

`r"..."` または `r'...'` と記述する生文字列リテラルは、Zilliz Cloud のフィルター式でバックスラッシュをそのまま保持します。バックスラッシュを含む `LIKE` および正規表現パターンには、これらの使用をお勧めします。生文字列を使用しない場合でも、通常の文字列リテラルはパターンが評価される前にエスケープシーケンスを処理するため、より多くのバックスラッシュが必要になることがあります。

## 正規表現を使用する | PUBLIC\{#use-regex-or-public}

パターンに文字クラス、繰り返し、選択、アンカー、大文字と小文字を区別しないマッチングなどの正規表現機能が必要な場合は、正規表現フィルターを使用します。Zilliz Cloud は、[RE2](https://github.com/google/re2/wiki/syntax) 正規表現を文字列値に適用します。

`=~` または `!~` の右側は文字列リテラルである必要があります。

| 演算子 | 意味 | 例 |
| --- | --- | --- |
| `=&#126;` | 正規表現パターンを満たす値に一致します。 | `filter = 'message =&#126; "E[0-9]{4}"'` |
| `!&#126;` | 正規表現パターンを満たす値を除外します。 | `filter = 'message !&#126; "^DEBUG"'` |

### 生文字列リテラルの使用\{#using-raw-string-literals}

バックスラッシュを含む正規表現パターンには、生文字列リテラルをお勧めします。`r"..."` または `r'...'` と記述する生文字列では、バックスラッシュがそのまま正規表現エンジンに渡されます。これにより、通常の文字列リテラルで必要となる追加のエスケープを回避できます。

例：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
filter = 'message =~ r"\d{4}-\d{2}-\d{2}"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "filename =~ r\"\\.json$\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := `filename =~ r"\.json$"`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'filename =~ r"\\.json$"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
string filter = "message =~ \"\\d{4}-\\d{2}-\\d{2}\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='filename =~ r"\.json$"'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'filename =~ r"\.json$"' --output-fields 'filename'
```

</TabItem>
</Tabs>

これは、`2026-07-01` のような日付形式の値を含む文字列に一致します。

生文字列を使用しない場合、通常の文字列リテラルは正規表現パターンが評価される前にエスケープシーケンスを処理するため、`\d`、`\s`、エスケープされたリテラル文字などのパターンには追加のバックスラッシュが必要になることがあります。

### 一般的な正規表現パターン\{#common-regex-patterns}

次の例では、Zilliz Cloud のフィルター式で一般的な RE2 構文を使用しています。完全な正規表現構文については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

| 要件 | パターン | フィルターの例 |
| --- | --- | --- |
| リテラルテキストを含む | `error` | `filter = 'message =&#126; "error"'` |
| プレフィックスで始まる | `^ERR` | `filter = 'code =&#126; "^ERR"'` |
| サフィックスで終わる | `\.json$` | `filter = 'filename =&#126; "\\.json$"'` |
| 数字のシーケンスに一致する | `[0-9]+` | `filter = 'message =&#126; "[0-9]+"'` |
| 固定桁数の数字に一致する | `[0-9]{4}` | `filter = 'code =&#126; "[0-9]{4}"'` |
| メールドメインに一致する | `@example\.com$` | `filter = 'email =&#126; "@example\\.com$"'` |
| 大文字と小文字を区別せずに一致する | `(?i)error` | `filter = 'message =&#126; "(?i)error"'` |
| 文字列全体に一致する | `^prod-[0-9]+$` | `filter = 'name =&#126; "^prod-[0-9]+$"'` |

複数の単語のいずれかに一致させるには、`|` による選択を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
filter = 'message =~ "error|failed|timeout"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "message =~ \"error|failed|timeout\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := `message =~ "error|failed|timeout"`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'message =~ "error|failed|timeout"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
string filter = "message =~ \"error|failed|timeout\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "error|failed|timeout"'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'message =~ "error|failed|timeout"' --output-fields 'message'
```

</TabItem>
</Tabs>

正規表現のメタ文字をリテラルとして一致させる場合は、正規表現パターン内でエスケープします。たとえば、リテラルのドット（正規表現では `\.`）に一致させるには、Python のフィルター文字列で `\\.` と記述します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
filter = 'email =~ "@gmail\\.com$"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "email =~ \"@gmail\\.com$\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := `email =~ "@gmail\\.com$"`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'email =~ "@gmail\\.com$"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
string filter = "email =~ \"@gmail\\.com$\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='email =~ "@gmail\\.com$"'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'email =~ "@gmail\\.com$"' --output-fields 'email'
```

</TabItem>
</Tabs>

注記：Zilliz Cloud の正規表現フィルターは RE2 構文に従います。正規表現パターンが RE2 でサポートされていない構文を使用している場合、またはその他の理由で無効な場合、Zilliz Cloud はフィルター式を拒否します。正規表現のメタ文字、フラグ、およびマッチング動作の詳細については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

### マッチング動作\{#matching-behavior}

**部分文字列のマッチング**

Zilliz Cloud の正規表現マッチングは、部分文字列のセマンティクスを使用します。パターンはフィールド値全体に一致する必要はありません。たとえば、次のフィルターは `E1001` と `failed with E1001 after retry` の両方に一致します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
filter = 'message =~ "E[0-9]{4}"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := `message =~ "E[0-9]{4}"`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'message =~ "E[0-9]{4}"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
string filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "E[0-9]{4}"'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message =~ "E[0-9]{4}"' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

フィールド値全体に一致させるには、`^` と `$` のアンカーを使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# Match only values that are exactly E followed by four digits
filter = 'code =~ "^E[0-9]{4}$"'
```

</TabItem>

<TabItem value='java'>

```java
// Match only values that are exactly E followed by four digits
String filter = "code =~ \"^E[0-9]{4}$\"";
```

</TabItem>

<TabItem value='go'>

```go
// Match only values that are exactly E followed by four digits
filter := `code =~ "^E[0-9]{4}$"`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Match only values that are exactly E followed by four digits
const filter = 'code =~ "^E[0-9]{4}$"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Match only values that are exactly E followed by four digits
string filter = "code =~ \"^E[0-9]{4}$\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='code =~ "^E[0-9]{4}$"'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'code =~ "^E[0-9]{4}$"' --output-fields 'code'
```

</TabItem>
</Tabs>

**nullable VARCHAR フィールド**

正規表現フィルターは null 値に一致しません。これは `=~` と `!~` の両方に当てはまります。正規表現パターンを除外しつつ null 値を保持する場合は、`OR field IS NULL` を明示的に追加します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
filter = 'message !~ "^DEBUG" OR message IS NULL'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "message !~ \"^DEBUG\" OR message IS NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := `message !~ "^DEBUG" OR message IS NULL`
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'message !~ "^DEBUG" OR message IS NULL';
```

</TabItem>

<TabItem value='csharp'>

```csharp
string filter = "message !~ \"^DEBUG\" OR message IS NULL";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message !~ "^DEBUG" OR message IS NULL'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message !~ "^DEBUG" OR message IS NULL' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

**JSON パス**

JSON パスの場合、パスが存在しない、null である、または文字列以外の値に解決されるときは、正規表現フィルターの動作が異なります：

| フィルター | 欠落/null/non-string の値を含みますか | 注記 |
| --- | --- | --- |
| `json_field["path"] =&#126; "pattern"` | いいえ | 正規表現パターンを満たす文字列値にのみ一致します。 |
| `json_field["path"] !&#126; "pattern"` | はい | パスが存在しない、null である、文字列以外である、または正規表現パターンに一致しない文字列であるエンティティを返します。 |

## インデックスでパターンマッチングを高速化する\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud は、`VARCHAR` フィールドまたは JSON 文字列パスに対する `LIKE` および正規表現フィルターと組み合わせて使用できる、`NGRAM`、`STL_SORT`、`INVERTED`、`BITMAP` など、文字列フィールドのいくつかのインデックスタイプをサポートしています。パターンマッチングはインデックスなしでも機能しますが、インデックスによって大規模なデータセットでのパフォーマンスを向上できます。

インデックスの有効性は、パターン式、Zilliz Cloud が固定リテラルの部分文字列を抽出できるかどうか、対象フィールドのカーディナリティと分布によって異なります。`name LIKE "Prod%"` などのプレフィックス形式のパターンは、`description LIKE "%vector%"` や `filename LIKE "%.json"` などの挿入位置またはサフィックス形式のパターンとは異なるインデックス戦略の恩恵を受ける場合があります。

次の表を出発点として使用し、その後に独自のワークロードでベンチマークしてください：

| パターンまたはデータ特性 | 検討するインデックス | 注記 |
| --- | --- | --- |
| `message =&#126; "error.*timeout"` や `message LIKE "%database%"` など、固定リテラルの部分文字列を含む | `NGRAM` | Zilliz Cloud がパターンから意味のあるリテラルの部分文字列を抽出できる場合に役立ちます。詳細については、[NGRAM](./ngram-index-type) を参照してください。 |
| プレフィックス、完全一致、または等価に近い文字列フィルター。特にカーディナリティが低から中程度のフィールド | `STL_SORT`、`INVERTED`、または `BITMAP` | フィールドに重複する値がある場合や、フィルターが完全一致に近い場合に、より効果的になることがあります。詳細については、[STL_SORT](./slt-sort-index-type)、[INVERTED](./inverted-index-type)、[BITMAP](./bitmap-index-type) を参照してください。 |
| 固定リテラルを含まない正規表現パターン、または文字クラス、短いトークン、ワイルドカードが主体のパターン | インデックスによる高速化に依存する前にベンチマークする | これらのパターンはインデックスの選択性が限られる可能性があり、より広範なスキャンにフォールバックすることがあります。 |
