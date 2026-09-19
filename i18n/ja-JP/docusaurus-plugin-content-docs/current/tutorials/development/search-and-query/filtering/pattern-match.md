---
title: "パターンマッチング | Cloud"
slug: /pattern-match
sidebar_label: "パターンマッチング"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "agentic search アプリケーションでは、ベクトル検索と grep スタイルのパターンマッチングが互いを補完することがよくあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングは、エラーコード、ログプレフィックス、メールドメイン、URL パス、識別子などの厳密な文字列構造によってその結果を絞り込みます。 | Cloud"
type: origin
token: PFbNwB7Mli18n6k6VWScGcpWndc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パターンマッチング

agentic search アプリケーションでは、ベクトル検索と grep スタイルのパターンマッチングが互いを補完することがよくあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングは、エラーコード、ログプレフィックス、メールドメイン、URL パス、識別子などの厳密な文字列構造によってその結果を絞り込みます。

Zilliz Cloud では、これらのパターン制約をスカラーフィルターで表現できます。単純なワイルドカードマッチングには `LIKE` を、[RE2](https://github.com/google/re2/wiki/syntax) 正規表現には `=~` または `!~` を使用します。これらのフィルターは `query`、`search`、ハイブリッド検索と組み合わせて使用できます。

<Admonition type="info" title="Note">

このページでは、query、search、ハイブリッド検索で使用されるスカラーフィルター式におけるパターンマッチングについて説明します。これらの式はフィールド値を評価するものであり、analyzer が生成するトークンを変更するものではありません。テキスト解析中にトークンをフィルタリングするには、[Regex Analyzer Filter](./regex-filter) を参照してください。

</Admonition>

パターンマッチング式は `filter` パラメーターに記述します。たとえば、次のクエリは `E1001` のようなエラーコードを含むログメッセージに一致します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

    "github.com/milvus-io/milvus/client/v2/milvusclient"
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message =~ "E[0-9]{4}"' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

このページの例では、`filter` に割り当てる式に焦点を当てています。同じフィルター式構文は、`query`、`search`、ハイブリッド検索など、スカラーフィルターを受け付ける Zilliz Cloud の操作で使用できます。

<Admonition type="info" title="Notes">

フィルター式の左辺のリテラルには、以下に示す例で使用されている `message`、`email` などのコレクションフィールド名、または `filter = 'struct[0][subfield] =~ "E[0-9]{4}"'` のように特定の要素インデックスにある StructArray サブフィールド名を指定できます。

StructArray フィールドにおけるスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## サポートされるフィールド型\{#supported-field-types}

パターンマッチングは文字列値で利用できます。

| 対象 | `LIKE` | Regex `=&#126;` / `!&#126;` | 注記 |
| --- | --- | --- | --- |
| `VARCHAR` フィールド | Yes | Yes | 文字列フィールドにおけるパターンマッチングの一般的な対象です。 |
| `VARCHAR` キャスト型の `JSON` パス | Yes | Yes | 一致させるには、JSON パスの値が文字列である必要があります。高速化のために JSON パスにインデックスを作成する場合は、`json_cast_type="varchar"` を設定してください。 |
| `ARRAY<VARCHAR>` 要素 | Yes | Yes | `tags[0]` のように、インデックスで特定の要素に一致させます。パターンマッチングはすべての要素をスキャン**しません**。指定したインデックスの要素にのみ適用されます。 |
| 数値、Boolean、ベクトル、`TEXT`、その他の非 `VARCHAR` の対象 | No | No | パターンマッチングは、`VARCHAR` 値、文字列に解決される JSON パス、またはインデックスが設定された `ARRAY<VARCHAR>` 要素に対してのみ利用できます。 |

## LIKE と regex の選び方\{#choose-like-or-regex}

必要なパターンを表現できる最も単純な演算子を選んでください。

厳密な文字列一致が必要な場合は、パターンマッチングではなく `==` の使用を推奨します。フィルターでパターンに一致させる必要がある場合にのみ、`LIKE` または regex を使用してください。

| 要件 | 推奨される演算子 | 例 | 説明 |
| --- | --- | --- | --- |
| 文字列の完全一致 | `==` | `status == "active"` | 文字列 `active` の完全一致です。 |
| 単純なプレフィックス一致 | `LIKE` | `name LIKE "Prod%"` | `Prod` で始まる文字列に一致します。 |
| 単純なサフィックス一致 | `LIKE` | `filename LIKE "%.json"` | `.json` で終わる文字列に一致します。 |
| 単純な部分文字列一致 | `LIKE` | `description LIKE "%vector database%"` | 文字列内の任意の位置に `vector database` を含む値に一致します。 |
| 構造化されたコードまたは固定長パターンに一致 | `=&#126;` | `code =&#126; "E[0-9]{4}"` | `E` の後に 4 桁の数字が続く文字列を大文字小文字を区別して含むものに一致します。例: `E1001`。 |
| 大文字小文字を区別しないパターンマッチング | `(?i)` を指定した `=&#126;` | `message =&#126; "(?i)error"` | `error`、`ERROR`、その他の大文字小文字のバリエーションに一致します。 |
| regex パターンに一致する値を除外 | `!&#126;` | `message !&#126; "^DEBUG"` | `DEBUG` で始まる文字列を除外します。 |

単純なワイルドカードマッチングには `LIKE` を使用します。文字クラス、繰り返し、`error|failed` のような選択、アンカー、または大文字小文字を区別しないマッチングが必要なパターンには regex を使用します。

## LIKE を使う\{#use-like}

`LIKE` 演算子は、文字列値に対する単純なワイルドカードマッチングに使用します。サポートされるワイルドカードは次のものだけです。

| ワイルドカード | 説明 |
| --- | --- |
| `%` | 0 文字以上の文字に一致します。 |
| `_` | ちょうど 1 文字に一致します。 |

### 一般的な LIKE パターン\{#common-like-patterns}

`%` と `_` の位置を使って、一致する文字列内で固定テキストが現れる位置を制御します。

| 要件 | パターン | フィルター例 |
| --- | --- | --- |
| プレフィックスで始まる | `Prod%` | `filter = 'name LIKE "Prod%"'` |
| サフィックスで終わる | `%.json` | `filter = 'filename LIKE "%.json"'` |
| 部分文字列を含む | `%vector%` | `filter = 'description LIKE "%vector%"'` |
| 固定位置の 1 文字に一致 | `AB_%` | `filter = 'code LIKE "AB_%"'` |

### LIKE のマッチング動作\{#like-matching-behavior}

`LIKE` は、プレフィックス、サフィックス、部分一致、および固定位置の単一文字一致に使用します。`LIKE` は `[0-9]` のような文字クラス、`error|failed` のような選択、`{4}` のような繰り返し回数、`^` や `$` のようなアンカー、`(?i)` のような大文字小文字を区別しないフラグをサポートしません。これらのパターンには regex を使用してください。

文字列全体の完全一致には `==` を使用します。`LIKE` は、フィルターでワイルドカードマッチングが必要な場合にのみ使用してください。

### LIKE パターン内でのワイルドカードのエスケープ\{#escaping-wildcards-in-a-like-pattern}

`LIKE` パターンでは、`%` は任意の文字数に一致し、`_` は 1 文字に一致します。`%`、`_`、または `\` にリテラルとして一致させるには、その文字をバックスラッシュ（`\`）でエスケープします。

- `name LIKE r"\%"` は、リテラル値 `%` に一致します。

- `name LIKE r"\_%"` は、リテラルの `_` で始まる値に一致します。

- `name LIKE r"\\%"` は、リテラルのバックスラッシュで始まる値に一致します。

`r"..."` または `r'...'` と書く raw string literal は、Zilliz Cloud のフィルター式内でバックスラッシュをそのまま保持します。バックスラッシュを含む `LIKE` および regex パターンでは、これらの使用を推奨します。raw string を使用しない場合、通常の string literal ではパターンが評価される前にエスケープシーケンスが処理されるため、より多くのバックスラッシュが必要になることがあります。

## regex を使う\{#use-regex}

文字クラス、繰り返し、選択、アンカー、大文字小文字を区別しないマッチングなど、正規表現機能が必要な場合は regex フィルターを使用します。Zilliz Cloud は文字列値に対して [RE2](https://github.com/google/re2/wiki/syntax) 正規表現を適用します。

`=~` または `!~` の右辺は string literal である必要があります。

| 演算子 | 意味 | 例 |
| --- | --- | --- |
| `=&#126;` | regex パターンを満たす値に一致します。 | `filter = 'message =&#126; "E[0-9]{4}"'` |
| `!&#126;` | regex パターンを満たす値を除外します。 | `filter = 'message !&#126; "^DEBUG"'` |

### raw string literal の使用\{#using-raw-string-literals}

バックスラッシュを含む regex パターンには raw string literal を推奨します。`r"..."` または `r'...'` と書く raw string では、バックスラッシュがそのまま regex エンジンに渡されます。これにより、通常の string literal で必要になる追加のエスケープを避けられます。

例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
const filter = 'filename =~ r"\\.json$"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='filename =~ r"\.json$"'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'filename =~ r"\.json$"' --output-fields 'filename'
```

</TabItem>
</Tabs>

これは、`2026-07-01` のような日付形式の値を含む文字列に一致します。

raw string を使用しない場合、通常の string literal では regex パターンが評価される前にエスケープシーケンスが処理されるため、`\d`、`\s`、またはエスケープされたリテラル文字のようなパターンには追加のバックスラッシュが必要になることがあります。

### 一般的な regex パターン\{#common-regex-patterns}

次の例では、Zilliz Cloud のフィルター式で一般的な RE2 構文を使用しています。完全な regex 構文については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

| 要件 | パターン | フィルター例 |
| --- | --- | --- |
| リテラルテキストを含む | `error` | `filter = 'message =&#126; "error"'` |
| プレフィックスで始まる | `^ERR` | `filter = 'code =&#126; "^ERR"'` |
| サフィックスで終わる | `\.json$` | `filter = 'filename =&#126; "\\.json$"'` |
| 数字列に一致 | `[0-9]+` | `filter = 'message =&#126; "[0-9]+"'` |
| 固定桁数の数字に一致 | `[0-9]{4}` | `filter = 'code =&#126; "[0-9]{4}"'` |
| メールドメインに一致 | `@example\.com$` | `filter = 'email =&#126; "@example\\.com$"'` |
| 大文字小文字を区別せずに一致 | `(?i)error` | `filter = 'message =&#126; "(?i)error"'` |
| 文字列全体に一致 | `^prod-[0-9]+$` | `filter = 'name =&#126; "^prod-[0-9]+$"'` |

複数の単語のいずれか 1 つに一致させるには、`|` を使った選択を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
const filter = 'message =~ "error|failed|timeout"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "error|failed|timeout"'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'message =~ "error|failed|timeout"' --output-fields 'message'
```

</TabItem>
</Tabs>

regex のメタ文字自体にリテラルとして一致させる場合は、regex パターン内でエスケープしてください。たとえば、リテラルのドット（regex では `\.`）に一致させるには、Python の filter 文字列では `\\.` と記述します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
const filter = 'email =~ "@gmail\\.com$"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='email =~ "@gmail\\.com$"'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'email =~ "@gmail\\.com$"' --output-fields 'email'
```

</TabItem>
</Tabs>

注: Zilliz Cloud の regex フィルターは RE2 構文に従います。regex パターンが RE2 でサポートされていない構文を使用している場合、またはその他の理由で無効な場合、Zilliz Cloud はその filter 式を拒否します。regex のメタ文字、フラグ、マッチング動作の詳細については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

### マッチング動作\{#matching-behavior}

**部分文字列マッチング**

Zilliz Cloud の regex マッチングは部分文字列セマンティクスを使用します。パターンはフィールド値全体に一致する必要はありません。たとえば、次のフィルターは `E1001` と `failed with E1001 after retry` の両方に一致します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
const filter = 'message =~ "E[0-9]{4}"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "E[0-9]{4}"'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message =~ "E[0-9]{4}"' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

フィールド値全体に一致させるには、`^` と `$` のアンカーを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
// Match only values that are exactly E followed by four digits
const filter = 'code =~ "^E[0-9]{4}$"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='code =~ "^E[0-9]{4}$"'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection my_collection --filter 'code =~ "^E[0-9]{4}$"' --output-fields 'code'
```

</TabItem>
</Tabs>

**Nullable な VARCHAR フィールド**

regex フィルターは null 値に一致しません。これは `=~` と `!~` の両方に当てはまります。regex パターンに一致するものを除外しつつ null 値を保持する場合は、明示的に `OR field IS NULL` を追加してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='javascript'>

```javascript
const filter = 'message !~ "^DEBUG" OR message IS NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message !~ "^DEBUG" OR message IS NULL'
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector query --collection log_events --filter 'message !~ "^DEBUG" OR message IS NULL' --output-fields 'message,severity'
```

</TabItem>
</Tabs>

**JSON パス**

JSON パスの場合、パスが存在しない、null、または非文字列値に解決されるときは、regex フィルターの動作が異なります。

| フィルター | missing/null/non-string 値を含むか | 注記 |
| --- | --- | --- |
| `json_field["path"] =&#126; "pattern"` | No | regex パターンを満たす文字列値にのみ一致します。 |
| `json_field["path"] !&#126; "pattern"` | Yes | パスが存在しない、null、非文字列、または regex パターンに一致しない文字列であるエンティティを返します。 |

## インデックスによるパターンマッチングの高速化\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud は、文字列フィールドに対して、`VARCHAR` フィールドや JSON 文字列パスに対する `LIKE` および regex フィルターと併用できるいくつかのインデックスタイプ（`NGRAM`、`STL_SORT`、`INVERTED`、`BITMAP` など）をサポートしています。パターンマッチングはインデックスなしでも動作しますが、インデックスによって大規模なデータセットでのパフォーマンスを改善できます。

インデックスの有効性は、パターン式、Zilliz Cloud が固定リテラルの部分文字列を抽出できるかどうか、および対象フィールドのカーディナリティと分布によって異なります。`name LIKE "Prod%"` のようなプレフィックス形式のパターンは、`description LIKE "%vector%"` や `filename LIKE "%.json"` のような中間一致やサフィックス形式のパターンとは異なるインデックス戦略が有効な場合があります。

次の表を出発点として使用し、その後、実際のワークロードでベンチマークしてください。

| パターンまたはデータの特性 | 検討すべきインデックス | 注記 |
| --- | --- | --- |
| `message =&#126; "error.*timeout"` や `message LIKE "%database%"` のように、固定リテラルの部分文字列を含む | `NGRAM` | Zilliz Cloud がパターンから意味のあるリテラル部分文字列を抽出できる場合に役立ちます。詳細は [NGRAM](./ngram-index-type) を参照してください。 |
| プレフィックス、完全一致、または等価一致に近い文字列フィルター。特にカーディナリティが低〜中程度のフィールド | `STL_SORT`、`INVERTED`、または `BITMAP` | フィールドに繰り返し値がある場合や、フィルターが完全一致に近い場合に、より効果的です。詳細は [STL_SORT](./slt-sort-index-type)、[INVERTED](./inverted-index-type)、[BITMAP](./bitmap-index-type) を参照してください。 |
| 固定リテラルを含まない regex パターン、または文字クラス、短いトークン、ワイルドカードが主体のパターン | インデックスによる高速化に依存する前にベンチマークする | これらのパターンはインデックスの選択性が限定的で、より広範なスキャンにフォールバックする可能性があります。 |
