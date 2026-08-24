---
title: "QueryIterator() | Cloud"
slug: /cpp/cpp/Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "フィルター式に基づき、スカラーフィールドを対象として QueryIterator オブジェクトを取得します。イテレーターの使用中は MilvusClientV2 を切断しないでください。また、リクエストにはプライマリーキーのフィールド名を指定します。 | Cloud"
type: docx
token: T4HRdSHCboHtR4xmvxqcekTvnX7
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - QueryIterator()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

フィルター式に基づき、スカラーフィールドを対象として QueryIterator オブジェクトを取得します。イテレーターの使用中は MilvusClientV2 を切断しないでください。また、リクエストにはプライマリーキーのフィールド名を指定します。

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

**リクエストメソッド:**

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

    整合性レベルを設定します。詳細については、ドキュメントを参照してください: https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式内のプレースホルダーに値を1つ追加します。この機能は、リクエストに空でないフィルターが含まれる場合にのみ使用され、大きなリテラル値の繰り返しパースを回避するために利用します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置換します。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値にはブール値、数値、文字列、または配列データを指定できます。

- `WithLimit(int64_t limit)`

    limit 値を設定します。式が空の場合にのみ有効です。\n 注: この値は ExtraParams に格納されます。

- `WithOffset(int64_t offset)`

    offset 値を設定します。式が空の場合にのみ有効です。\n 注: この値は ExtraParams に格納されます。

- `WithIgnoreGrowing(bool ignore_growing)`

    growing セグメントを無視するよう設定します。注: この値は ExtraParams に格納されます。

- `AddExtraParam(const std::string& key, const std::string& value)`

    追加パラメーターを設定します。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに対して有効です。注: この値は ExtraParams に格納されます。

- `WithOrderByFields(std::ベクトル<OrderByField>&& order_by_fields)`

    クエリ結果のソートに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    クエリ結果のソートに使用するフィールドを追加します。

- `WithReduceStopForBest(bool reduce_stop_for_best)`

    内部取得戦略のフラグを設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドの列指向データを表すテンプレートクラスです。サポートされているすべてのデータ型に対応する具象エイリアスが用意されています。具象型のインスタンスは、`InsertRequest::WithRowsData()` を使ったデータ挿入や、/search、`QueryResults::OutputField()`、`SingleResult::OutputField()` を使ったクエリ結果の読み取りに使用します。

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

このクラスは、`Query()` の呼び出しによって返される列指向の結果データを保持します。`QueryResponse` オブジェクトに対して `Results()` を呼び出すことでアクセスできます。

```c++
const QueryResults& results = response.Results();
```

**メソッド:**

- `FieldDataPtr OutputField(const std::string& name) const`

    指定された名前の出力フィールドを `FieldDataPtr` として返します。具象型へキャストするには `std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` を使用します。

- `const std::ベクトル<FieldDataPtr>& OutputFields() const`

    サーバーから返された順序で、すべての出力フィールドを返します。

- `const std::set<std::string>& OutputFieldNames() const`

    クエリで要求された出力フィールド名のセットを返します。

- `Status OutputRows(EntityRows& rows) const`

    すべての結果行を JSON ライクな行マップのベクトルに変換し、`rows` に格納します。

- `Status OutputRow(int i, EntityRow& row) const`

    インデックス `i` の行を JSON ライクな行マップに変換します。

- `uint64_t GetRowCount() const`

    返された行数を返します。クエリで `count(*)` が使用されている場合、このメソッドは集計カウントを返します。

### Iterator\{#iterator}

QueryIterator は Iterator&lt;QueryResults&gt; のエイリアスです。結果セット全体が1回のリクエスト制限を超える場合に、クエリ結果をバッチ単位で取得するために使用します。

### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは `FieldDataPtr` を通じて返されます。具象 `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターとして使用する場合は `OutputField(name)` を、型チェック付きの shared ポインターキャストを行う場合は `OutputField<T>(name)` を使用します。

ポインターの命名規則は XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt; です。この結果表現はクエリインターフェースで使用されるものであり、ポインターエイリアスが個別の API ページとして定義されることはありません。

### Iterator\{#iterator}

抽象基底クラスです。直接インスタンス化せず、後述の QueryIterator エイリアスを使用してください。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### QueryIterator\{#queryiterator}

`QueryIterator()` 呼び出しから返される `QueryResults` バッチを順に処理します。`Next()` を呼び出すたびに、次の行バッチが `QueryResults` に格納されます。

```c++
using QueryIterator    = Iterator<QueryResults>;
using QueryIteratorPtr = std::shared_ptr<QueryIterator>;
```

`MilvusClientV2::QueryIterator(IteratorArguments, QueryIteratorPtr&)` を通じて取得します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細を確認するには、例外メッセージまたは返された Status を参照してください。

## 例\{#example}

C++ SDK を使用した QueryIterator() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryIteratorRequest();
milvus::QueryIteratorPtr response;
util::CheckStatus(client->QueryIterator(request, response));
```
