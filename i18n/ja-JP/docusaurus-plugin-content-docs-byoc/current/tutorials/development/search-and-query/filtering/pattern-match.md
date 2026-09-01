---
title: "パターンマッチング | BYOC"
slug: /pattern-match
sidebar_label: "パターンマッチング"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エージェント検索アプリケーションでは、ベクトル検索と grep 形式のパターンマッチングが互いに補完し合うことがよくあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子といった正確な文字列構造に基づいて結果を絞り込みます。 | BYOC"
type: origin
token: PFbNwB7Mli18n6k6VWScGcpWndc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パターンマッチング

エージェント検索アプリケーションでは、ベクトル検索と grep 形式のパターンマッチングが互いに補完し合うことがよくあります。ベクトル検索は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子といった正確な文字列構造に基づいて結果を絞り込みます。

Zilliz Cloud では、これらのパターン制約をスカラーフィルターで表現できます。単純なワイルドカードマッチングには `LIKE` を使用し、[RE2](https://github.com/google/re2/wiki/syntax) 正規表現には `=~` または `!~` を使用します。これらのフィルターは、`query`、`search`、またはハイブリッド検索と組み合わせることができます。

<Admonition type="info" icon="📘" title="Note">

このページでは、`query`、`search`、およびハイブリッド検索で使用されるスカラーフィルター式のパターンマッチングについて説明します。これらの式はフィールド値を評価するものであり、アナライザーが生成するトークンを変更しません。テキスト分析中にトークンをフィルタリングするには、[Regex Analyzer Filter](./regex-filter) を参照してください。

</Admonition>

パターンマッチング式は `filter` パラメーターに記述します。たとえば、次のクエリは `E1001` のようなエラーコードを含むログメッセージに一致します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

このページの例では、`filter` に指定する式を中心に説明しています。`query`、`search`、ハイブリッド検索など、スカラーフィルターを受け入れる Zilliz Cloud 操作でも同じフィルター式構文を使用できます。

<Admonition type="info" icon="📘" title="Notes">

フィルター式の左辺のリテラルには、以下の例で使用されている `message` や `email` などのコレクションフィールド名、あるいは `filter = 'struct[0][subfield] =~ "E[0-9]{4}"'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## サポートされるフィールド型\{#supported-field-types}

パターンマッチングは文字列値に対して利用できます。

| 対象 | `LIKE` | Regex `=&#126;` / `!&#126;` | 備考 |
| --- | --- | --- | --- |
| `VARCHAR` フィールド | はい | はい | 文字列フィールドにおけるパターンマッチングの一般的な対象です。 |
| `JSON` パス（`VARCHAR` キャスト型） | はい | はい | 一致させるには、JSON パスの値が文字列である必要があります。高速化のために JSON パスにインデックスを作成する場合は、`json_cast_type="varchar"` を設定してください。 |
| `ARRAY<VARCHAR>` 要素 | はい | はい | `tags[0]` のように、インデックスを指定して特定の要素に一致させます。パターンマッチングはすべての要素をスキャン**せず**、指定されたインデックスの要素にのみ適用されます。 |
| 数値、Boolean、ベクトル、`TEXT`、その他の非 `VARCHAR` 対象 | いいえ | いいえ | パターンマッチングは、`VARCHAR` 値、文字列に解決される JSON パス、またはインデックス付き `ARRAY<VARCHAR>` 要素に対してのみ利用できます。 |

## LIKE と正規表現の使い分け\{#choose-like-or-regex}

必要なパターンを表現できる最も単純な演算子を選択してください。

文字列の完全一致が必要な場合は、パターンマッチングではなく `==` を使用することを推奨します。`LIKE` や正規表現は、フィルターがパターンに一致する必要がある場合にのみ使用してください。

| 要件 | 推奨演算子 | 例 | 説明 |
| --- | --- | --- | --- |
| 文字列の完全一致 | `==` | `status == "active"` | 文字列 `active` に完全一致します。 |
| 単純なプレフィックス一致 | `LIKE` | `name LIKE "Prod%"` | `Prod` で始まる文字列に一致します。 |
| 単純なサフィックス一致 | `LIKE` | `filename LIKE "%.json"` | `.json` で終わる文字列に一致します。 |
| 単純な部分一致 | `LIKE` | `description LIKE "%vector database%"` | 文字列内の任意の位置に `vector database` を含む値に一致します。 |
| 構造化コードまたは固定長パターンの一致 | `=&#126;` | `code =&#126; "E[0-9]{4}"` | `E` の後に 4 桁の数字が続く文字列（`E1001` など）に、大文字小文字を区別して一致します。 |
| 大文字小文字を区別しないパターンマッチング | `=&#126;` with `(?i)` | `message =&#126; "(?i)error"` | `error`、`ERROR`、またはその他の大文字小文字のバリエーションに一致します。 |
| 正規表現パターンに一致する値の除外 | `!&#126;` | `message !&#126; "^DEBUG"` | `DEBUG` で始まる文字列を除外します。 |

単純なワイルドカードマッチングには `LIKE` を使用します。文字クラス、繰り返し、`error|failed` のような選択、アンカー、または大文字小文字を区別しないマッチングが必要な場合は、正規表現を使用してください。

## LIKE の使用\{#use-like}

`LIKE` 演算子は、文字列値に対する単純なワイルドカードマッチング用です。サポートされるワイルドカードは以下のとおりです。

| ワイルドカード | 説明 |
| --- | --- |
| `%` | 0 文字以上の任意の文字に一致します。 |
| `_` | 任意の 1 文字に一致します。 |

### 一般的な LIKE パターン\{#common-like-patterns}

`%` と `_` の配置によって、固定テキストが一致文字列内のどこに現れるかを制御できます。

| 要件 | パターン | フィルター例 |
| --- | --- | --- |
| プレフィックスで始まる | `Prod%` | `filter = 'name LIKE "Prod%"'` |
| サフィックスで終わる | `%.json` | `filter = 'filename LIKE "%.json"'` |
| 部分文字列を含む | `%vector%` | `filter = 'description LIKE "%vector%"'` |
| 固定位置の 1 文字に一致 | `AB_%` | `filter = 'code LIKE "AB_%"'` |

### LIKE のマッチング動作\{#like-matching-behavior}

`LIKE` は、前方一致、後方一致、部分一致、および固定位置の 1 文字マッチに使用します。`LIKE` は、`[0-9]` などの文字クラス、`error|failed` などの選択、`{4}` などの繰り返し回数、`^` や `$` などのアンカー、`(?i)` などの大文字小文字を区別しないフラグをサポートしていません。これらのパターンには regex を使用してください。

文字列の完全一致には `==` を使用します。ワイルドカードによるマッチが必要な場合にのみ `LIKE` を使用してください。

### LIKE パターンでのワイルドカードのエスケープ\{#escaping-wildcards-in-a-like-pattern}

`LIKE` パターンでは、`%` は任意の文字数にマッチし、`_` は 1 文字にマッチします。`%`、`_`、または `\` をリテラルとしてマッチさせるには、バックスラッシュ（`\`）でエスケープします。

- `name LIKE r"\%"` は、リテラル値 `%` にマッチします。

- `name LIKE r"\_%"` は、リテラルの `_` で始まる値にマッチします。

- `name LIKE r"\\%"` は、リテラルのバックスラッシュで始まる値にマッチします。

raw 文字列リテラルは `r"..."` または `r'...'` と記述され、Zilliz Cloud フィルター式内でバックスラッシュをそのまま保持します。バックスラッシュを含む `LIKE` パターンや regex パターンには、raw 文字列リテラルの使用が推奨されます。raw 文字列を使用しない場合、通常の文字列リテラルはパターン評価前にエスケープシーケンスを処理するため、より多くのバックスラッシュが必要になることがあります。

## regex の使用\{#use-regex}

文字クラス、繰り返し、選択、アンカー、大文字小文字を区別しないマッチなど、正規表現の機能が必要な場合は regex フィルターを使用します。Zilliz Cloud は、文字列値に対して [RE2](https://github.com/google/re2/wiki/syntax) 正規表現を適用します。

`=~` または `!~` の右辺には文字列リテラルを指定する必要があります。

| 演算子 | 説明 | 例 |
| --- | --- | --- |
| `=&#126;` | regex パターンに合致する値にマッチします。 | `filter = 'message =&#126; "E[0-9]{4}"'` |
| `!&#126;` | regex パターンに合致する値を除外します。 | `filter = 'message !&#126; "^DEBUG"'` |

### raw 文字列リテラルの使用\{#using-raw-string-literals}

バックスラッシュを含む regex パターンには、raw 文字列リテラルの使用が推奨されます。`r"..."` または `r'...'` と記述される raw 文字列では、バックスラッシュがそのまま regex エンジンに渡されます。これにより、通常の文字列リテラルで必要となる追加のエスケープを回避できます。

例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

これは、`2026-07-01` のような日付形式の値を含む文字列にマッチします。

raw 文字列を使用しない場合、通常の文字列リテラルは regex パターンの評価前にエスケープシーケンスを処理するため、`\d`、`\s`、またはエスケープされたリテラル文字などのパターンで追加のバックスラッシュが必要になることがあります。

### 一般的な regex パターン\{#common-regex-patterns}

以下の例では、Zilliz Cloud フィルター式でよく使われる RE2 構文を示します。regex 構文の詳細については、[RE2 構文](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

| 要件 | パターン | フィルターの例 |
| --- | --- | --- |
| リテラルテキストを含む | `error` | `filter = 'message =&#126; "error"'` |
| 接頭辞で始まる | `^ERR` | `filter = 'code =&#126; "^ERR"'` |
| 接尾辞で終わる | `\.json$` | `filter = 'filename =&#126; "\\.json$"'` |
| 数字の並びにマッチする | `[0-9]+` | `filter = 'message =&#126; "[0-9]+"'` |
| 固定桁数の数字にマッチする | `[0-9]{4}` | `filter = 'code =&#126; "[0-9]{4}"'` |
| メールのドメインにマッチする | `@example\.com$` | `filter = 'email =&#126; "@example\\.com$"'` |
| 大文字小文字を区別せずにマッチする | `(?i)error` | `filter = 'message =&#126; "(?i)error"'` |
| 文字列全体にマッチする | `^prod-[0-9]+$` | `filter = 'name =&#126; "^prod-[0-9]+$"'` |

複数の単語のいずれかにマッチさせるには、`|` を使った選択を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

regex のメタ文字をリテラルとしてマッチさせる場合は、regex パターン内でエスケープします。たとえば、リテラルのドット（regex では `\.`）にマッチさせるには、Python のフィルター文字列で `\\.` と記述します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

注: Zilliz Cloud の regex フィルターは RE2 構文に従います。regex パターンが RE2 でサポートされていない構文を使用している場合や、その他の理由で無効な場合、Zilliz Cloud はそのフィルター式を拒否します。regex のメタ文字、フラグ、マッチング動作の詳細については、[RE2 構文](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

### マッチング動作\{#matching-behavior}

**部分文字列マッチ**

Zilliz Cloud の regex マッチは部分文字列セマンティクスに基づきます。パターンはフィールド値全体にマッチする必要はありません。たとえば、以下のフィルターは `E1001` と `failed with E1001 after retry` の両方にマッチします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

フィールド値全体にマッチさせるには、`^` と `$` のアンカーを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

**NULL 許容 VARCHAR フィールド**

regex フィルターは null 値にマッチしません。これは `=~` と `!~` の両方に当てはまります。regex パターンに合致する値を除外しつつ null 値を残したい場合は、明示的に `OR field IS NULL` を追加してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

**JSON パス**

JSON パスに対しては、パスが存在しない、null である、または文字列以外の値に解決される場合に、regex フィルターの動作が異なります。

| フィルター | 欠落/null/non-string値を含むか | 備考 |
| --- | --- | --- |
| `json_field["path"] =&#126; "pattern"` | いいえ | regex パターンに合致する文字列値のみにマッチします。 |
| `json_field["path"] !&#126; "pattern"` | はい | パスが存在しない、null である、文字列以外である、または regex パターンに合致しない文字列であるエンティティを返します。 |

## インデックスによるパターンマッチングの高速化\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud は、文字列フィールドに対して `NGRAM`、`STL_SORT`、`INVERTED`、`BITMAP` など複数のインデックスタイプをサポートしており、これらを `LIKE` や正規表現フィルターと組み合わせて、`VARCHAR` フィールドや JSON 文字列パスで使用できます。パターンマッチングはインデックスなしでも動作しますが、インデックスを利用することで大規模データセットでのパフォーマンスを向上できます。

インデックスの有効性は、パターン式の内容、Zilliz Cloud が固定リテラル部分文字列を抽出できるかどうか、および対象フィールドのカーディナリティと値の分布に依存します。`name LIKE "Prod%"` のような前方一致パターンは、`description LIKE "%vector%"` や `filename LIKE "%.json"` のような中間一致・後方一致パターンとは、適したインデックス戦略が異なる場合があります。

以下の表を目安として、実際のワークロードでベンチマークを行ってください。

| パターンまたはデータの特性 | 推奨インデックス | 備考 |
| --- | --- | --- |
| `message =&#126; "error.*timeout"` や `message LIKE "%database%"` など、固定リテラル部分文字列を含む | `NGRAM` | Zilliz Cloud がパターンから意味のあるリテラル部分文字列を抽出できる場合に有効です。詳細は [NGRAM](./ngram-index-type) を参照してください。 |
| 前方一致、完全一致、または等価比較に近い文字列フィルター（特に低〜中程度のカーディナリティを持つフィールド） | `STL_SORT`、`INVERTED`、または `BITMAP` | フィールドに重複する値が多い場合や、フィルターが完全一致に近い場合に、より高い効果が期待できます。詳細は [STL_SORT](./slt-sort-index-type)、[INVERTED](./inverted-index-type)、[BITMAP](./bitmap-index-type) を参照してください。 |
| 固定リテラルを含まない正規表現パターン、または文字クラス、短いトークン、ワイルドカードが主体のパターン | インデックスによる高速化に依存する前にベンチマークを実施してください | これらのパターンではインデックスの選択性が低く、広範なスキャンにフォールバックする可能性があります。 |
