---
title: "模式匹配 | BYOC"
slug: /pattern-match
sidebar_label: "模式匹配"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在智能体搜索应用中，向量搜索和 grep 风格的模式匹配通常相辅相成。向量搜索用于检索语义相关的实体，而模式匹配则根据精确的字符串结构进一步缩小结果范围，例如错误代码、日志前缀、电子邮件域名、URL 路径或标识符。 | BYOC"
type: origin
token: NqgAwwXOHi0Hm8kUNl1cfV9VnQ9
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 模式匹配

在智能体搜索应用中，向量搜索和 grep 风格的模式匹配通常相辅相成。向量搜索用于检索语义相关的实体，而模式匹配则根据精确的字符串结构进一步缩小结果范围，例如错误代码、日志前缀、电子邮件域名、URL 路径或标识符。

在 Zilliz Cloud 中，可以在标量过滤表达式中使用 `LIKE` 进行简单通配符匹配，使用 `=~` 或 `!~` 进行 [RE2](https://github.com/google/re2/wiki/syntax) 正则表达式匹配。您可以将这些过滤表达式与 `query`、`search` 或混合搜索结合使用。

<Admonition type="info" icon="📘" title="Note">

本页介绍 `query`、`search` 和混合搜索所用标量过滤表达式中的模式匹配。这些表达式用于计算字段值，不会改变分析器生成的 token。若要在文本分析期间过滤 token，请参阅[正则表达式分析器过滤器](./regex-filter)。

</Admonition>

模式匹配表达式写在 `filter` 参数中。例如，以下查询匹配包含 `E1001` 之类错误代码的日志消息：

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

本页示例重点介绍赋给 `filter` 的表达式。在 Zilliz Cloud 中，凡是接受标量过滤表达式的操作（例如 `query`、`search` 和混合搜索），都可以使用相同的过滤表达式语法。

<Admonition type="info" icon="📘" title="说明">

过滤表达式左侧的字面量既可以是 Collection Field 名称（如后文示例中的 `message`、`email` 等），也可以是特定元素索引处的 StructArray 子字段名称，例如 `filter = 'struct[0][subfield] =~ "E[0-9]{4}"'`。

有关 StructArray Field 中标量过滤的详细信息，请参阅[StructArray 操作符](./struct-array-filtering)。

</Admonition>

## 支持的字段类型\{#supported-field-types}

模式匹配适用于字符串值。

| 匹配目标 | `LIKE` | 正则表达式 `=&#126;` / `!&#126;` | 说明 |
| --- | --- | --- | --- |
| `VARCHAR` 字段 | 是 | 是 | 字符串字段上模式匹配的典型目标。 |
| `JSON` 路径（`VARCHAR` 转换类型） | 是 | 是 | 要获得正向匹配，JSON 路径值必须是字符串。如果为 JSON 路径创建索引以加速查询，请设置 `json_cast_type="varchar"`。 |
| `ARRAY<VARCHAR>` 元素 | 是 | 是 | 按索引匹配特定元素，例如 `tags[0]`。模式匹配**不会**扫描所有元素，而只会应用于指定索引处的元素。 |
| 数值、布尔值、向量、`TEXT` 或其他非 `VARCHAR` 目标 | 否 | 否 | 模式匹配仅适用于 `VARCHAR` 值、解析为字符串的 JSON 路径或已建立索引的 `ARRAY<VARCHAR>` 元素。 |

## 选择 LIKE 或正则表达式\{#choose-like-or-regex}

请选择能够表达所需模式的最简单操作符。

如果需要精确匹配字符串，建议使用 `==`，而不是模式匹配。仅当过滤表达式需要匹配某种模式时，才使用 `LIKE` 或正则表达式。

| 要求 | 推荐操作符 | 示例 | 说明 |
| --- | --- | --- | --- |
| 精确字符串相等 | `==` | `status == "active"` | 精确匹配字符串 `active`。 |
| 简单前缀匹配 | `LIKE` | `name LIKE "Prod%"` | 匹配以 `Prod` 开头的字符串。 |
| 简单后缀匹配 | `LIKE` | `filename LIKE "%.json"` | 匹配以 `.json` 结尾的字符串。 |
| 简单包含匹配 | `LIKE` | `description LIKE "%vector database%"` | 匹配字符串中任意位置包含 `vector database` 的值。 |
| 匹配结构化代码或固定长度模式 | `=&#126;` | `code =&#126; "E[0-9]{4}"` | 以区分大小写的方式匹配包含 `E` 后跟四位数字的字符串，例如 `E1001`。 |
| 不区分大小写的模式匹配 | `=&#126;` 配合 `(?i)` | `message =&#126; "(?i)error"` | 匹配 `error`、`ERROR` 或其他大小写形式。 |
| 排除匹配正则表达式模式的值 | `!&#126;` | `message !&#126; "^DEBUG"` | 排除以 `DEBUG` 开头的字符串。 |

使用 `LIKE` 进行简单通配符匹配。当模式需要字符类、重复、`error|failed` 之类的分支、锚点或不区分大小写的匹配时，请使用正则表达式。

## 使用 LIKE\{#use-like}

`LIKE` 操作符用于对字符串值进行简单通配符匹配。它仅支持以下通配符：

| 通配符 | 说明 |
| --- | --- |
| `%` | 匹配零个或多个字符。 |
| `_` | 恰好匹配一个字符。 |

### 常见 LIKE 模式\{#common-like-patterns}

通过 `%` 和 `_` 的位置控制固定文本在匹配字符串中出现的位置。

| 要求 | 模式 | 过滤示例 |
| --- | --- | --- |
| 以前缀开头 | `Prod%` | `filter = 'name LIKE "Prod%"'` |
| 以后缀结尾 | `%.json` | `filter = 'filename LIKE "%.json"'` |
| 包含子字符串 | `%vector%` | `filter = 'description LIKE "%vector%"'` |
| 在固定位置匹配一个字符 | `AB_%` | `filter = 'code LIKE "AB_%"'` |

### LIKE 匹配行为\{#like-matching-behavior}

使用 `LIKE` 进行前缀、后缀、包含以及固定位置单字符匹配。`LIKE` 不支持 `[0-9]` 之类的字符类、`error|failed` 之类的分支、`{4}` 之类的重复次数、`^` 或 `$` 之类的锚点，也不支持 `(?i)` 之类的不区分大小写标志。这些模式请使用正则表达式。

使用 `==` 进行完整字符串精确相等匹配。仅当过滤表达式需要通配符匹配时，才使用 `LIKE`。

### 转义 LIKE 模式中的通配符\{#escaping-wildcards-in-a-like-pattern}

在 `LIKE` 模式中，`%` 匹配任意数量的字符，`_` 匹配一个字符。若要按字面值匹配 `%`、`_` 或 `\`，请使用反斜杠（`\`）转义该字符：

- `name LIKE r"\%"` 匹配字面值 `%`。

- `name LIKE r"\_%"` 匹配以字面量 `_` 开头的值。

- `name LIKE r"\\%"` 匹配以字面反斜杠开头的值。

原始字符串字面量写作 `r"..."` 或 `r'...'`，它会在 Zilliz Cloud 过滤表达式中原样保留反斜杠。对于包含反斜杠的 `LIKE` 和正则表达式模式，建议使用原始字符串。如果不使用原始字符串，普通字符串字面量会在模式求值前处理转义序列，因此可能需要更多反斜杠。

## 使用正则表达式\{#use-regex}

当模式需要字符类、重复、分支、锚点或不区分大小写等正则表达式功能时，请使用正则表达式过滤。Zilliz Cloud 会将 [RE2](https://github.com/google/re2/wiki/syntax) 正则表达式应用于字符串值。

`=~` 或 `!~` 的右侧必须是字符串字面量。

| 操作符 | 含义 | 示例 |
| --- | --- | --- |
| `=&#126;` | 匹配满足正则表达式模式的值。 | `filter = 'message =&#126; "E[0-9]{4}"'` |
| `!&#126;` | 排除满足正则表达式模式的值。 | `filter = 'message !&#126; "^DEBUG"'` |

### 使用原始字符串字面量\{#using-raw-string-literals}

对于包含反斜杠的正则表达式模式，建议使用原始字符串字面量。在写作 `r"..."` 或 `r'...'` 的原始字符串中，反斜杠会原样传递给正则表达式引擎，从而避免普通字符串字面量所需的额外转义。

例如：

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

该表达式匹配包含 `2026-07-01` 之类日期格式值的字符串。

如果不使用原始字符串，普通字符串字面量会在正则表达式模式求值前处理转义序列，因此 `\d`、`\s` 或经过转义的字面字符等模式可能需要额外的反斜杠。

### 常见正则表达式模式\{#common-regex-patterns}

以下示例在 Zilliz Cloud 过滤表达式中使用常见的 RE2 语法。有关完整的正则表达式语法，请参阅 [RE2 语法参考](https://github.com/google/re2/wiki/syntax)。

| 要求 | 模式 | 过滤示例 |
| --- | --- | --- |
| 包含字面文本 | `error` | `filter = 'message =&#126; "error"'` |
| 以前缀开头 | `^ERR` | `filter = 'code =&#126; "^ERR"'` |
| 以后缀结尾 | `\.json$` | `filter = 'filename =&#126; "\\.json$"'` |
| 匹配数字序列 | `[0-9]+` | `filter = 'message =&#126; "[0-9]+"'` |
| 匹配固定位数的数字 | `[0-9]{4}` | `filter = 'code =&#126; "[0-9]{4}"'` |
| 匹配电子邮件域名 | `@example\.com$` | `filter = 'email =&#126; "@example\\.com$"'` |
| 不区分大小写匹配 | `(?i)error` | `filter = 'message =&#126; "(?i)error"'` |
| 匹配完整字符串 | `^prod-[0-9]+$` | `filter = 'name =&#126; "^prod-[0-9]+$"'` |

若要匹配多个单词中的任意一个，请使用 `|` 进行分支匹配：

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

按字面值匹配正则表达式元字符时，请在正则表达式模式中进行转义。例如，若要匹配字面点号（正则表达式中的 `\.`），请在 Python 过滤字符串中写作 `\\.`：

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

注意：Zilliz Cloud 正则表达式过滤遵循 RE2 语法。如果正则表达式模式使用 RE2 不支持的语法，或模式本身无效，Zilliz Cloud 会拒绝该过滤表达式。有关正则表达式元字符、标志和匹配行为的详细信息，请参阅 [RE2 语法参考](https://github.com/google/re2/wiki/syntax)。

### 匹配行为\{#matching-behavior}

**子字符串匹配**

Zilliz Cloud 的正则表达式匹配采用子字符串语义，模式无需匹配整个字段值。例如，以下过滤表达式既匹配 `E1001`，也匹配 `failed with E1001 after retry`：

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

若要匹配整个字段值，请使用 `^` 和 `$` 锚点：

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

**可为空的 VARCHAR 字段**

正则表达式过滤不会匹配 null 值，`=~` 和 `!~` 都是如此。如果希望排除某个正则表达式模式但保留 null 值，请显式添加 `OR field IS NULL`：

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

**JSON 路径**

对于 JSON 路径，当路径缺失、值为 null 或解析为非字符串值时，正则表达式过滤的行为有所不同：

| 过滤表达式 | 是否包含缺失值、null 值或非字符串值？ | 说明 |
| --- | --- | --- |
| `json_field["path"] =&#126; "pattern"` | 否 | 仅匹配满足正则表达式模式的字符串值。 |
| `json_field["path"] !&#126; "pattern"` | 是 | 返回路径缺失、值为 null、值为非字符串，或字符串值不匹配正则表达式模式的实体。 |

## 使用索引加速模式匹配\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud 支持多种字符串字段索引类型，可与 `VARCHAR` 字段或 JSON 字符串路径上的 `LIKE` 和正则表达式过滤配合使用，例如 `NGRAM`、`STL_SORT`、`INVERTED` 和 `BITMAP`。模式匹配无需索引也能工作，但在大型数据集上，索引可以提升性能。

索引效果取决于模式表达式、Zilliz Cloud 能否提取固定的字面子字符串，以及目标字段的基数和数据分布。`name LIKE "Prod%"` 之类的前缀模式，适用的索引策略可能不同于 `description LIKE "%vector%"` 或 `filename LIKE "%.json"` 之类的中缀或后缀模式。

可以先参考下表进行选择，再使用自己的工作负载执行基准测试：

| 模式或数据特征 | 可考虑的索引 | 说明 |
| --- | --- | --- |
| 包含固定的字面子字符串，例如 `message =&#126; "error.*timeout"` 或 `message LIKE "%database%"` | `NGRAM` | 当 Zilliz Cloud 能够从模式中提取有意义的字面子字符串时，此索引会有所帮助。有关详细信息，请参阅 [NGRAM](./ngram-index-type)。 |
| 前缀、精确或近似相等的字符串过滤，尤其适用于低到中等基数的字段 | `STL_SORT`、`INVERTED` 或 `BITMAP` | 当字段包含重复值，或过滤表达式接近精确匹配时，这些索引可能更有效。有关详细信息，请参阅 [STL_SORT](./slt-sort-index-type)、[INVERTED](./inverted-index-type) 和 [BITMAP](./bitmap-index-type)。 |
| 不包含固定字面量的正则表达式模式，或以字符类、短 token 或通配符为主的模式 | 依赖索引加速前先执行基准测试 | 这些模式的索引选择性可能有限，并可能退化为范围更广的扫描。 |
