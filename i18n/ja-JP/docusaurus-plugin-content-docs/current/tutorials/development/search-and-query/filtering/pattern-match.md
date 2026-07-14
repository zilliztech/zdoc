---
title: "パターンマッチング | Cloud"
slug: /pattern-match
sidebar_label: "パターンマッチング"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エージェント型検索アプリケーションでは、vector search と grep スタイルのパターンマッチングはしばしば相互補完的に機能します。vector search は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子などの正確な文字列構造によってそれらの結果を絞り込みます。 | Cloud"
type: origin
token: PFbNwB7Mli18n6k6VWScGcpWndc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# パターンマッチング

エージェント型検索アプリケーションでは、vector search と grep スタイルのパターンマッチングはしばしば相互補完的に機能します。vector search は意味的に関連するエンティティを取得し、パターンマッチングはエラーコード、ログプレフィックス、メールドメイン、URL パス、識別子などの正確な文字列構造によってそれらの結果を絞り込みます。

Zilliz Cloud では、これらのパターン制約をスカラー filter で表現できます。単純なワイルドカードマッチングには `LIKE` を、[RE2](https://github.com/google/re2/wiki/syntax) 正規表現には `=~` または `!~` を使用します。これらの filter は `query`、`search`、またはハイブリッド検索と組み合わせて使用できます。

パターンマッチング式は `filter` パラメータに記述します。たとえば、次の query は `E1001` のようなエラーコードを含むログメッセージに一致します。

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

このページの例では、`filter` に割り当てる式に焦点を当てています。同じ filter 式の構文は、`query`、`search`、ハイブリッド検索など、スカラー filter を受け付ける Zilliz Cloud の操作で使用できます。

<Admonition type="info" icon="📘" title="注意">

フィルタリング式の左辺にあるリテラルは、以下の例で使用する `message`、`email` などの collection フィールド名、または `filter = 'struct[0][subfield] =~ "E[0-9]{4}"'` のように特定の要素インデックスにある StructArray サブフィールド名のいずれかにできます。 

StructArray フィールドでのスカラー filter の詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## サポートされるフィールド型\{#supported-field-types}

パターンマッチングは文字列値で使用できます。

| 対象 | `LIKE` | Regex `=&#126;` / `!&#126;` | 注意 |
| --- | --- | --- | --- |
| `VARCHAR` フィールド | はい | はい | 文字列フィールドでのパターンマッチングの一般的な対象です。 |
| `VARCHAR` キャスト型を持つ `JSON` パス | はい | はい | 正の一致には JSON パスの値が文字列である必要があります。高速化のために JSON パスに index を作成する場合は、`json_cast_type="varchar"` を設定してください。 |
| `ARRAY<VARCHAR>` 要素 | はい | はい | `tags[0]` のように、インデックスで特定の要素に一致させます。パターンマッチングは全要素をスキャンしません。指定されたインデックスの要素にのみ適用されます。 |
| 数値、Boolean、vector、`TEXT`、またはその他の非 `VARCHAR` 対象 | いいえ | いいえ | パターンマッチングは `VARCHAR` 値、文字列に解決される JSON パス、またはインデックスで指定した `ARRAY<VARCHAR>` 要素でのみ使用できます。 |

## LIKE と regex の選び方\{#choose-like-or-regex}

必要なパターンを表現できる最もシンプルな演算子を選択してください。

正確な文字列一致が必要な場合は、パターンマッチングではなく `==` を使用することを推奨します。filter がパターンに一致する必要がある場合にのみ `LIKE` または regex を使用してください。

| 要件 | 推奨演算子 | 例 | 説明 |
| --- | --- | --- | --- |
| 正確な文字列一致 | `==` | `status == "active"` | 文字列 `active` に正確に一致します。 |
| 単純なプレフィックス一致 | `LIKE` | `name LIKE "Prod%"` | `Prod` で始まる文字列に一致します。 |
| 単純なサフィックス一致 | `LIKE` | `filename LIKE "%.json"` | `.json` で終わる文字列に一致します。 |
| 単純な部分文字列一致 | `LIKE` | `description LIKE "%vector database%"` | 文字列内の任意の位置に `vector database` を含む値に一致します。 |
| 構造化コードまたは固定長パターンに一致 | `=&#126;` | `code =&#126; "E[0-9]{4}"` | `E1001` のように、大文字小文字を区別して `E` に続く 4 桁の数字を含む文字列に一致します。 |
| 大文字小文字を区別しないパターンマッチング | `(?i)` を指定した `=&#126;` | `message =&#126; "(?i)error"` | `error`、`ERROR`、その他の大小文字バリエーションに一致します。 |
| regex パターンに一致する値を除外 | `!&#126;` | `message !&#126; "^DEBUG"` | `DEBUG` で始まる文字列を除外します。 |

単純なワイルドカードマッチングには `LIKE` を使用してください。文字クラス、繰り返し、`error|failed` のような選択、アンカー、大文字小文字を区別しない一致が必要な場合は regex を使用してください。

## LIKE を使う\{#use-like}

`LIKE` 演算子は、文字列値に対する単純なワイルドカードマッチング用です。サポートするワイルドカードは次の 2 つだけです。

| ワイルドカード | 説明 |
| --- | --- |
| `%` | 0 文字以上に一致します。 |
| `_` | ちょうど 1 文字に一致します。 |

### よく使う LIKE パターン\{#common-like-patterns}

`%` と `_` の位置を使って、一致する文字列内のどこに固定テキストが現れるかを制御します。

| 要件 | パターン | Filter の例 |
| --- | --- | --- |
| プレフィックスで始まる | `Prod%` | `filter = 'name LIKE "Prod%"'` |
| サフィックスで終わる | `%.json` | `filter = 'filename LIKE "%.json"'` |
| 部分文字列を含む | `%vector%` | `filter = 'description LIKE "%vector%"'` |
| 固定位置の 1 文字に一致 | `AB_%` | `filter = 'code LIKE "AB_%"'` |

### LIKE の一致動作\{#like-matching-behavior}

`LIKE` はプレフィックス、サフィックス、部分一致、および固定位置の 1 文字一致に使用してください。`LIKE` は `[0-9]` のような文字クラス、`error|failed` のような選択、`{4}` のような繰り返し回数、`^` や `$` のようなアンカー、`(?i)` のような大文字小文字を区別しないフラグをサポートしません。これらのパターンには regex を使用してください。

完全な文字列一致には `==` を使用してください。ワイルドカードマッチングが必要な場合にのみ `LIKE` を使用してください。

### LIKE パターン内でのワイルドカードのエスケープ\{#escaping-wildcards-in-a-like-pattern}

`LIKE` パターンでは、`%` は任意の文字数に一致し、`_` は 1 文字に一致します。`%`、`_`、または `\` 自体に一致させるには、バックスラッシュ (`\`) で文字をエスケープします。

- `name LIKE r"\%"` はリテラル値 `%` に一致します。

- `name LIKE r"\_%"` はリテラルの `_` で始まる値に一致します。

- `name LIKE r"\\%"` はリテラルのバックスラッシュで始まる値に一致します。

`r"..."` または `r'...'` と記述する raw string literal は、Zilliz Cloud filter 式内でバックスラッシュをそのまま保持します。バックスラッシュを含む `LIKE` や regex パターンでは使用を推奨します。raw string を使わない場合、通常の string literal はパターン評価前にエスケープシーケンスを処理するため、より多くのバックスラッシュが必要になることがあります。

## regex を使う\{#use-regex}

文字クラス、繰り返し、選択、アンカー、大文字小文字を区別しない一致などの正規表現機能が必要な場合は regex filter を使用してください。Zilliz Cloud は文字列値に [RE2](https://github.com/google/re2/wiki/syntax) 正規表現を適用します。

`=~` または `!~` の右辺は string literal でなければなりません。

| 演算子 | 意味 | 例 |
| --- | --- | --- |
| `=&#126;` | regex パターンを満たす値に一致します。 | `filter = 'message =&#126; "E[0-9]{4}"'` |
| `!&#126;` | regex パターンを満たす値を除外します。 | `filter = 'message !&#126; "^DEBUG"'` |

### raw string literal の使用\{#using-raw-string-literals}

バックスラッシュを含む regex パターンには raw string literal を推奨します。`r"..."` または `r'...'` と記述する raw string では、バックスラッシュが regex エンジンにそのまま渡されます。これにより、通常の string literal で必要となる追加のエスケープを回避できます。

例:

```python
filter = 'message =~ r"\d{4}-\d{2}-\d{2}"'
```

これは `2026-07-01` のような日付形式の値を含む文字列に一致します。

raw string を使わない場合、通常の string literal は regex パターンが評価される前にエスケープシーケンスを処理するため、`\d`、`\s`、またはエスケープされたリテラル文字のようなパターンでは追加のバックスラッシュが必要になる場合があります。

### よく使う regex パターン\{#common-regex-patterns}

次の例では、Zilliz Cloud filter 式で一般的な RE2 構文を使用しています。完全な regex 構文については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

| 要件 | パターン | Filter の例 |
| --- | --- | --- |
| リテラルテキストを含む | `error` | `filter = 'message =&#126; "error"'` |
| プレフィックスで始まる | `^ERR` | `filter = 'code =&#126; "^ERR"'` |
| サフィックスで終わる | `\.json$` | `filter = 'filename =&#126; "\\.json$"'` |
| 数字列に一致 | `[0-9]+` | `filter = 'message =&#126; "[0-9]+"'` |
| 固定桁数の数字に一致 | `[0-9]{4}` | `filter = 'code =&#126; "[0-9]{4}"'` |
| メールドメインに一致 | `@example\.com$` | `filter = 'email =&#126; "@example\\.com$"'` |
| 大文字小文字を区別せず一致 | `(?i)error` | `filter = 'message =&#126; "(?i)error"'` |
| 文字列全体に一致 | `^prod-[0-9]+$` | `filter = 'name =&#126; "^prod-[0-9]+$"'` |

複数の単語のいずれか 1 つに一致させるには、`|` を使った選択を使用します。

```python
filter = 'message =~ "error|failed|timeout"'
```

regex のメタ文字をリテラルとして一致させる場合は、regex パターン内でそれらをエスケープしてください。たとえば、リテラルのドット（regex では `\.`）に一致させるには、Python の filter string では `\\.` と記述します。

```python
filter = 'email =~ "@gmail\\.com$"'
```

注: Zilliz Cloud の regex filter は RE2 構文に従います。regex パターンが RE2 でサポートされていない構文を使用している場合、またはその他の理由で無効な場合、Zilliz Cloud はその filter 式を拒否します。regex メタ文字、フラグ、一致動作の詳細については、[RE2 syntax](https://github.com/google/re2/wiki/syntax) リファレンスを参照してください。

### 一致動作\{#matching-behavior}

**部分文字列一致**

Zilliz Cloud の regex 一致は部分文字列セマンティクスを使用します。パターンはフィールド値全体に一致する必要はありません。たとえば、次の filter は `E1001` と `failed with E1001 after retry` の両方に一致します。

```python
filter = 'message =~ "E[0-9]{4}"'
```

フィールド値全体に一致させるには、`^` と `$` アンカーを使用してください。

```python
# Match only values that are exactly E followed by four digits
filter = 'code =~ "^E[0-9]{4}$"'
```

**Nullable VARCHAR fields**

regex filter は null 値には一致しません。これは `=~` と `!~` の両方に当てはまります。regex パターンを除外しつつ null 値は保持したい場合は、明示的に `OR field IS NULL` を追加してください。

```python
filter = 'message !~ "^DEBUG" OR message IS NULL'
```

**JSON paths**

JSON パスに対しては、パスが存在しない場合、null の場合、または非文字列値に解決される場合に、regex filter の動作が異なります。

| Filter | missing/null/non-string 値を含むか | 注意 |
| --- | --- | --- |
| `json_field["path"] =&#126; "pattern"` | いいえ | regex パターンを満たす文字列値にのみ一致します。 |
| `json_field["path"] !&#126; "pattern"` | はい | パスが存在しない、null、非文字列、または regex パターンに一致しない文字列であるエンティティを返します。 |

## index を使ってパターンマッチングを高速化する\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud は文字列フィールドに対して複数の index タイプをサポートしており、`VARCHAR` フィールドまたは JSON 文字列パスに対する `LIKE` や regex filter と組み合わせて使用できます。たとえば `NGRAM`、`STL_SORT`、`INVERTED`、`BITMAP` です。パターンマッチングは index なしでも機能しますが、大規模データセットでは index によってパフォーマンスが向上する場合があります。

index の有効性は、パターン式、Zilliz Cloud が固定リテラル部分文字列を抽出できるかどうか、および対象フィールドのカーディナリティと分布に依存します。`name LIKE "Prod%"` のようなプレフィックス型パターンは、`description LIKE "%vector%"` や `filename LIKE "%.json"` のような中間一致またはサフィックス型パターンとは異なる index 戦略の恩恵を受ける場合があります。

まずは次の表を出発点として使用し、その後ご自身のワークロードでベンチマークしてください。

| パターンまたはデータ特性 | 検討すべき index | 注意 |
| --- | --- | --- |
| `message =&#126; "error.*timeout"` や `message LIKE "%database%"` のように、固定リテラル部分文字列を含む | `NGRAM` | Zilliz Cloud がパターンから意味のあるリテラル部分文字列を抽出できる場合に役立ちます。詳細は [NGRAM](./ngram-index-type) を参照してください。 |
| プレフィックス、完全一致、または等価比較に近い文字列 filter。特に低〜中程度のカーディナリティを持つフィールド | `STL_SORT`、`INVERTED`、または `BITMAP` | フィールドに繰り返し値がある場合や、filter がほぼ完全一致に近い場合により効果的なことがあります。詳細は [STL_SORT](./slt-sort-index-type)、[INVERTED](./inverted-index-type)、[BITMAP](./bitmap-index-type) を参照してください。 |
| 固定リテラルを持たない regex パターン、または文字クラス、短いトークン、ワイルドカードが支配的なパターン | index の高速化に依存する前にベンチマークしてください | これらのパターンでは index の選択性が限定的となり、より広いスキャンにフォールバックする場合があります。 |
