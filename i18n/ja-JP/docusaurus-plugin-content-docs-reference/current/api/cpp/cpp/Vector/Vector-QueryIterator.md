---
title: "QueryIterator() | Cloud"
slug: /cpp/cpp/Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "フィルター式に基づいてスカラーフィールドから QueryIterator オブジェクトを取得します。イテレーターの使用中は MilvusClientV2 を切断しないでください。プライマリキーフィールド名をリクエストに割り当てます。 | Cloud"
type: docx
token: T4HRdSHCboHtR4xmvxqcekTvnX7
sidebar_position: 6
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - QueryIterator()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

フィルター式に基づいて、スカラーフィールドから QueryIterator オブジェクトを取得します。イテレーターの使用中は MilvusClientV2 を切断しないでください。プライマリキーフィールド名をリクエストに割り当てます。

```c++
Status QueryIterator(QueryIteratorRequest& request, QueryIteratorPtr& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = QueryIteratorRequest()
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
    .WithLimit(limit)
    .WithOffset(offset)
    .WithIgnoreGrowing(ignore_growing)
    .AddExtraParam(key, value)
    .WithTimezone(timezone)
    .WithOrderByFields(order_by_fields)
    .AddOrderByField(order_by_field)
    .WithReduceStopForBest(reduce_stop_for_best);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトデータベースを使用します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合、コレクション全体をクエリします。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。[整合性レベル](/docs/consistency-level)。

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式内のプレースホルダーに 1 つの値を追加します。これは、リクエストに空でないフィルターがある場合にのみ使用され、大きなリテラル値の繰り返し解析を回避します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値には boolean 値、数値、文字列、または配列データを指定できます。

- `WithLimit(int64_t limit)`

    制限値を設定します。式が空の場合にのみ使用できます。\n 注記：この値は ExtraParams に保存されます。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。式が空の場合にのみ使用できます。\n 注記：この値は ExtraParams に保存されます。

- `WithIgnoreGrowing(bool ignore_growing)`

    growing セグメントを無視するように設定します。注記：この値は ExtraParams に保存されます。

- `AddExtraParam(const std::string& key, const std::string& value)`

    追加のパラメーターを追加します。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに適用されます。注記：この値は ExtraParams に保存されます。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    クエリ結果の並べ替えに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    クエリ結果の並べ替えに使用するフィールドを追加します。

- `WithReduceStopForBest(bool reduce_stop_for_best)`

    内部取得戦略のフラグを設定します。

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

これは、単一フィールドの列ベースのデータを表すテンプレートクラスです。具象エイリアスは、サポートされるすべてのデータ型をカバーします。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入する場合や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を介して query/search 結果を読み取る場合に使用されます。

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

このクラスは、`Query()` 呼び出しによって返される列ベースの結果データを保持します。`QueryResponse` オブジェクトの `Results()` を介してアクセスします。

```c++
const QueryResults& results = response.Results();
```

**メソッド：**

- `FieldDataPtr OutputField(const std::string& name) const`

    指定した名前の出力フィールドを `FieldDataPtr` として返します。`std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` を使用して具象型にキャストします。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    サーバーから返された順序ですべての出力フィールドを返します。

- `const std::set<std::string>& OutputFieldNames() const`

    クエリで要求された出力フィールド名のセットを返します。

- `Status OutputRows(EntityRows& rows) const`

    すべての結果行を JSON 形式の行マップのベクトルに変換し、`rows` に格納します。

- `Status OutputRow(int i, EntityRow& row) const`

    インデックス `i` の行を JSON 形式の行マップに変換します。

- `uint64_t GetRowCount() const`

    返された行数。クエリで `count(*)` を使用すると、集計された件数が返されます。

### Iterator\{#iterator}

QueryIterator は Iterator&lt;QueryResults&gt; のエイリアスです。完全な結果セットが 1 回のリクエストの制限より大きい場合に、クエリ行をバッチ単位で取得するために使用します。

### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは、`FieldDataPtr` を介して返されます。具象型 `XxxFieldData` は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を使用し、チェック済みの共有ポインターキャストには `OutputField<T>(name)` を使用します。

ポインターの規則は XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt; です。この結果表現はクエリインターフェースで使用され、ポインターエイリアスが個別の API ページになるわけではありません。

### Iterator\{#iterator}

抽象基底クラスです。直接インスタンス化しないでください。以下の QueryIterator エイリアスを使用してください。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### QueryIterator\{#queryiterator}

`QueryIterator()` 呼び出しからの `QueryResults` バッチを反復処理します。`Next()` を呼び出すたびに、次の行バッチで `QueryResults` が埋められます。

```c++
using QueryIterator    = Iterator<QueryResults>;
using QueryIteratorPtr = std::shared_ptr<QueryIterator>;
```

`MilvusClientV2::QueryIterator(IteratorArguments, QueryIteratorPtr&)` を介して取得します。

**エラー処理：**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で QueryIterator() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryIteratorRequest();
milvus::QueryIteratorPtr response;
util::CheckStatus(client->QueryIterator(request, response));
```
