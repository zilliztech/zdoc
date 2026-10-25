---
title: "Query() | Cloud"
slug: /cpp/cpp/Vector-Query
sidebar_label: "Query()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "一連の条件でクエリを実行し、クエリに完全に一致するレコードのリストを返します。 | Cloud"
type: docx
token: LtZhdRryBo4vAwxHJmDcbsKvnhK
sidebar_position: 5
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - ベクトルデータベースオープンソース
  - オープンソースベクトルDB
  - zilliz
  - zilliz cloud
  - cloud
  - Query()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Query()

一連の条件でクエリを実行し、クエリに完全に一致するレコードのリストを返します。

```c++
Status Query(const QueryRequest& request, QueryResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = QueryRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .AddPartitionName(partition_name)
    .WithOutputFields(output_field_names)
    .AddOutputField(output_field)
    .WithConsistencyLevel(consistency_level)
    .WithFilter(filter)
    .AddFilterTemplate(key, filter_template)
    .WithFilterTemplates(filter_templates)
    .WithIDs(int64_id_array)
    .WithIDs(string_id_array)
    .WithLimit(limit)
    .WithOffset(offset)
    .WithIgnoreGrowing(ignore_growing)
    .AddExtraParam(key, value)
    .WithTimezone(timezone)
    .WithOrderByFields(order_by_fields)
    .AddOrderByField(order_by_field);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合、コレクション全体に対してクエリが実行されます。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。詳細については、[整合性レベル](/docs/consistency-level) を参照してください。

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式のプレースホルダーに値を1つ追加します。これは、リクエストに空でないフィルターがある場合にのみ使用され、大きなリテラル値を繰り返し解析することを回避します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値にはブール値、数値、文字列、または配列データを指定できます。

- `WithIDs(std::vector<int64_t>&& id_array)`

    レコードが返される整数のプライマリキーを設定します。注：ID とフィルターは同時に設定できません。

- `WithIDs(std::vector<std::string>&& id_array)`

    レコードが返される文字列のプライマリキーを設定します。注：ID とフィルターは同時に設定できません。

- `WithLimit(int64_t limit)`

    limit 値を設定します。式が空の場合にのみ使用できます。\n 注：この値は ExtraParams に格納されます。

- `WithOffset(int64_t offset)`

    offset 値を設定します。式が空の場合にのみ使用できます。\n 注：この値は ExtraParams に格納されます。

- `WithIgnoreGrowing(bool ignore_growing)`

    growing セグメントを無視するように設定します。注：この値は ExtraParams に格納されます。

- `AddExtraParam(const std::string& key, const std::string& value)`

    追加パラメーターを追加します。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに対して有効です。注：この値は ExtraParams に格納されます。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    クエリ結果を並べ替えるために使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    クエリ結果を並べ替えるために使用するフィールドを追加します。

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドの列指向データを表すテンプレートクラスです。具象エイリアスは、サポートされているすべてのデータ型を網羅しています。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入する場合、または `QueryResults::OutputField()` と `SingleResult::OutputField()` を介してクエリ結果と /search 結果を読み取る場合に使用されます。

```c++
// Base abstract interface (not instantiated directly)
class Field {
    const std::string& Name() const;
    DataType Type() const;
    DataType ElementType() const;   // for ARRAY fields only
    virtual size_t Count() const = 0;
    virtual void Reserve(size_t count) = 0;
};

using FieldDataPtr = std::shared_ptr<Field>;

// Template class
template <typename T, DataType Dt>
class FieldData : public Field {
    explicit FieldData(std::string name);
    FieldData(std::string name, const std::vector<T>& data);
    FieldData(std::string name, const std::vector<T>& data, const std::vector<bool>& valid_data);

    StatusCode Add(const T& element);
    StatusCode AddNull();
    StatusCode Append(const std::vector<T>& elements);
    size_t Count() const;
    void Reserve(size_t count);
    virtual const std::vector<T>& Data() const;
    virtual T Value(size_t i) const;
    virtual bool IsNull(size_t i) const;
    virtual const std::vector<bool>& ValidData() const;
};
```

### QueryResults\{#queryresults}

このクラスは、`Query()` の呼び出しによって返される列指向の結果データを保持します。`QueryResponse` オブジェクトの `Results()` を介してアクセスします。

```c++
const QueryResults& results = response.Results();
```

**メソッド：**

- `FieldDataPtr OutputField(const std::string& name) const`

    指定した名前の出力フィールドを `FieldDataPtr` として返します。`std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` を使用して、具象型にキャストします。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    サーバーから返された順序で、すべての出力フィールドを返します。

- `const std::set<std::string>& OutputFieldNames() const`

    クエリで要求された出力フィールド名のセットを返します。

- `Status OutputRows(EntityRows& rows) const`

    すべての結果行を JSON ライクな行マップのベクトルに変換し、`rows` に格納します。

- `Status OutputRow(int i, EntityRow& row) const`

    インデックス `i` の行を JSON ライクな行マップに変換します。

- `uint64_t GetRowCount() const`

    返された行数です。クエリで `count(*)` を使用すると、集計カウントが返されます。

#### QueryResponse の統計\{#queryresponse-statistics}

`QueryResponse` オブジェクトは、クエリのコストを表す実行統計を公開します。

**メソッド：**

- `int64_t Cost() const`

    クエリのコストをミリ秒で返します。

- `int64_t ScannedRemoteBytes() const`

    リモートストレージからスキャンされたバイト数を返します。

- `int64_t ScannedTotalBytes() const`

    スキャンされた合計バイト数を返します。

- `float CacheHitRatio() const`

    キャッシュヒット率を 0.0 から 1.0 の範囲の値として返します。

#### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは、`FieldDataPtr` を介して返されます。具象 `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を使用し、チェック済みの共有ポインターキャストには `OutputField<T>(name)` を使用します。

ポインターの規則は `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>` です。この結果表現は検索インターフェースとクエリインターフェースで共有されており、ポインターエイリアスごとに別の API ページを作成するものではありません。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で Query() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryRequest();
milvus::QueryResponse response;
util::CheckStatus(client->Query(request, response));
```
