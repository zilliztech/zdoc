---
title: "DescribeCollection() | Cloud"
slug: /cpp/cpp/Collections-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スキーマやプロパティを含むコレクションの説明を取得します。 | Cloud"
type: docx
token: LwzwdSZkSoV2Nrxsv49cyb4SnZf
sidebar_position: 18
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DescribeCollection()

この操作は、スキーマやプロパティを含むコレクションの説明を取得します。

```c++
Status DescribeCollection(const DescribeCollectionRequest& request, DescribeCollectionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status*

操作が成功したかどうかを示す Status を返します。成功した場合、スキーマやプロパティを含むコレクションの完全な説明が応答に含まれます。

- **response** (*DescribeCollectionResponse*) -

    - **Desc** (*const CollectionDesc&*) -

        コレクションの説明を取得します。

        - **DatabaseName** (*const std::string&*) -

            このコレクションが属するデータベース名です。

        - **CollectionName** (*const std::string&*) -

            コレクション名です。

        - **Description** (*const std::string&*) -

            コレクションの説明です。

        - **NumShards** (*int64_t*) -

            コレクションのシャード数です。

        - **スキーマ** (*const CollectionSchema&*) -

            コレクションのスキーマです。

            - **Name** (*const std::string&*) -

                コレクション名です。空にはできません。

            - **Description** (*const std::string&*) -

                コレクションの説明です。空でもかまいません。

            - **ShardsNum** (*int32_t*) -

                コレクションのシャード数です。数値は 0 より大きい必要があり、デフォルト値は 2 です。

            - **EnableDynamicField** (*bool*) -

                宣言されていないフィールドを非表示の `meta` 動的フィールドに格納するかどうかです。有効にすると、スキーマで宣言されていないフィールドは、`meta` という名前の非表示 JSON フィールドにキーと値のペアとして格納されます。

            - **Fields** (*const std::ベクトル&lt;FieldSchema&gt;&*) -

                フィールドスキーマの配列です。

                - **Name** (*const std::string&*) -

                    このフィールドの名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    このフィールドの説明です。空でもかまいません。

                - **FieldDataType** ([DataType](./Collections-DataType)) -

                    フィールドのデータ型です。

                - **ElementType** ([DataType](./Collections-DataType)) -

                    配列フィールドの要素型です。

                - **IsPrimaryKey** (*bool*) -

                    このフィールドが主キーかどうかです。各コレクションには主キーが 1 つだけあります。主キーにできるのは INT64 および VARCHAR フィールドのみです。

                - **AutoID** (*bool*) -

                    フィールド項目の ID が自動生成されるかどうかです。主キーフィールドにのみ適用されます。true の場合、サーバーは挿入時に ID を生成します。それ以外の場合、クライアントはエンティティごとに ID を指定する必要があります。

                - **IsPartitionKey** (*bool*) -

                    フィールド項目の ID がパーティションキーかどうかです。パーティションキーは各エンティティをパーティションにルーティングします。パーティションキーフィールドは null 許容にできません。

                - **IsClusteringKey** (*bool*) -

                    フィールド項目の ID がクラスタリングキーかどうかです。

                - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                    このフィールドの追加のキーと値のペア設定です。

                - **Dimension** (*uint32_t*) -

                    ベクトルフィールドの次元を取得します。

                - **MaxLength** (*uint32_t*) -

                    varchar フィールドの最大長を取得します。

                - **MaxCapacity** (*uint32_t*) -

                    配列フィールドの最大容量を取得します。

                - **IsEnableAnalyzer** (*bool*) -

                    アナライザーを有効にするかどうかのフラグを取得します。

                - **IsEnableMatch** (*bool*) -

                    テキストマッチを有効にするかどうかのフラグを取得します。

                - **AnalyzerParams** (*nlohmann::json*) -

                    アナライザーパラメーターを取得します。

                - **MultiAnalyzerParams** (*nlohmann::json*) -

                    マルチアナライザーパラメーターを取得します。

                - **IsNullable** (*bool*) -

                    フィールド値が null 許容かどうかのフラグを取得します。null 許容フィールドは、挿入時に値が省略された場合または明示的に NULL の場合に NULL を格納します。主キーおよびパーティションキーフィールドは null 許容にできません。NULL を含むベクトルフィールドは、IS NULL 式でフィルタリングできません。

                - **DefaultValue** (*const nlohmann::json&*) -

                    このフィールドのデフォルト値を取得します。

                - **ExternalField** (*const std::string&*) -

                    外部フィールドのマッピング名を取得します。

            - **StructFields** (*const std::ベクトル&lt;StructFieldSchema&gt;&*) -

                構造体フィールドスキーマの配列です。

                - **Name** (*const std::string&*) -

                    このフィールドの名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    このフィールドの説明です。空でもかまいません。

                - **MaxCapacity** (*int64_t*) -

                    構造体フィールドの最大容量を取得します。

                - **IsNullable** (*bool*) -

                    構造体フィールドが null 許容かどうかです。

                - **Fields** (*const std::ベクトル&lt;FieldSchema&gt;&*) -

                    構造体フィールドのサブフィールドを取得します。

                    - **Name** (*const std::string&*) -

                        このフィールドの名前です。空にはできません。

                    - **Description** (*const std::string&*) -

                        このフィールドの説明です。空でもかまいません。

                    - **FieldDataType** ([DataType](./Collections-DataType)) -

                        フィールドのデータ型です。

                    - **ElementType** ([DataType](./Collections-DataType)) -

                        配列フィールドの要素型です。

                    - **IsPrimaryKey** (*bool*) -

                        このフィールドが主キーかどうかです。各コレクションには主キーが 1 つだけあります。主キーにできるのは INT64 および VARCHAR フィールドのみです。

                    - **AutoID** (*bool*) -

                        フィールド項目の ID が自動生成されるかどうかです。主キーフィールドにのみ適用されます。true の場合、サーバーは挿入時に ID を生成します。それ以外の場合、クライアントはエンティティごとに ID を指定する必要があります。

                    - **IsPartitionKey** (*bool*) -

                        フィールド項目の ID がパーティションキーかどうかです。パーティションキーは各エンティティをパーティションにルーティングします。パーティションキーフィールドは null 許容にできません。

                    - **IsClusteringKey** (*bool*) -

                        フィールド項目の ID がクラスタリングキーかどうかです。

                    - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                        このフィールドの追加のキーと値のペア設定です。

                    - **Dimension** (*uint32_t*) -

                        ベクトルフィールドの次元を取得します。

                    - **MaxLength** (*uint32_t*) -

                        varchar フィールドの最大長を取得します。

                    - **MaxCapacity** (*uint32_t*) -

                        配列フィールドの最大容量を取得します。

                    - **IsEnableAnalyzer** (*bool*) -

                        アナライザーを有効にするかどうかのフラグを取得します。

                    - **IsEnableMatch** (*bool*) -

                        テキストマッチを有効にするかどうかのフラグを取得します。

                    - **AnalyzerParams** (*nlohmann::json*) -

                        アナライザーパラメーターを取得します。

                    - **MultiAnalyzerParams** (*nlohmann::json*) -

                        マルチアナライザーパラメーターを取得します。

                    - **IsNullable** (*bool*) -

                        フィールド値が null 許容かどうかのフラグを取得します。null 許容フィールドは、挿入時に値が省略された場合または明示的に NULL の場合に NULL を格納します。主キーおよびパーティションキーフィールドは null 許容にできません。NULL を含むベクトルフィールドは、IS NULL 式でフィルタリングできません。

                    - **DefaultValue** (*const nlohmann::json&*) -

                        このフィールドのデフォルト値を取得します。

                    - **ExternalField** (*const std::string&*) -

                        外部フィールドのマッピング名を取得します。

            - **AnnsFieldNames** (*std::unordered_set&lt;std::string&gt;*) -

                Anns フィールド名を返します。

            - **PrimaryFieldName** (*std::string*) -

                主キーフィールド名を返します。

            - **Functions** (*const std::ベクトル&lt;FunctionPtr&gt;&*) -

                関数の配列を取得します。

                - **Name** (*const std::string&*) -

                    この関数の名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    この関数の説明です。空でもかまいません。

                - **GetFunctionType** (*FunctionType*) -

                    関数の型です。

                - **InputFieldNames** (*const std::ベクトル&lt;std::string&gt;&*) -

                    入力フィールド名を取得します。

                - **OutputFieldNames** (*const std::ベクトル&lt;std::string&gt;&*) -

                    出力フィールド名を取得します。

                - **Params** (*const std::unordered_map&lt;std::string, std::string>&*) -

                    追加のパラメーターを取得します。

            - **ExternalSource** (*const std::string&*) -

                外部コレクションのソースパスを取得します。

            - **ExternalSpec** (*const nlohmann::json&*) -

                外部コレクションの仕様 JSON を取得します。

        - **ID** (*int64_t*) -

            コレクション ID です。

        - **Alias** (*const std::ベクトル&lt;std::string&gt;&*) -

            コレクションのエイリアスです。

        - **CreatedTime** (*uint64_t*) -

            コレクションが作成されたときのタイムスタンプです。

        - **UpdateTime** (*uint64_t*) -

            コレクションが更新されたときのタイムスタンプです。

        - **Properties** (*const std::unordered_map&lt;std::string, std::string>&*) -

            コレクションのプロパティです。

        - **ExternalSource** (*const std::string&*) -

            コレクションの外部データソースを取得します。

        - **ExternalSpec** (*const nlohmann::json&*) -

            コレクションの外部ファイル仕様を取得します。

        - **GetConsistencyLevel** ([ConsistencyLevel](./Collections-ConsistencyLevel)) -

            コレクションの整合性レベルです。

        - **NumPartitions** (*int64_t*) -

            コレクションのパーティション数です。パーティションキーを指定してコレクションを作成した場合にのみ有効です。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、または応答の処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で DescribeCollection() を呼び出し、スキーマやプロパティを含むコレクションの説明を DescribeCollectionResponse に取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
milvus::DescribeCollectionResponse response;
status = client->DescribeCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const milvus::CollectionDesc& desc = response.Desc();
std::cout << "collection: " << desc.CollectionName() << std::endl;
```
