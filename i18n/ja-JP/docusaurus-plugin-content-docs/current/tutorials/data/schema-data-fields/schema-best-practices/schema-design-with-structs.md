---
title: "構造体の配列によるデータモデル設計 | Cloud"
slug: /schema-design-with-structs
sidebar_label: "構造体によるデータモデル"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "現代のAIアプリケーション、特にIoTや自動運転では、センサー読み取り値とタイムスタンプおよびベクトル埋め込み、診断ログとエラーコードおよび音声スニペット、または位置、速度、およびシーンのコンテキストを含むトリップセグメントなどのように、リッチな構造化イベントを推論します。これらには、ネストされたデータのネイティブな取り込みと検索をデータベースがサポートする必要があります。 | Cloud"
type: origin
token: VOkIwd5adiziGQkoDO1cRoRFnre
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - schema design
  - hands-on
  - structs
  - array of structs
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


# 構造体の配列によるデータモデル設計

現代のAIアプリケーション、特にIoTや自動運転では、リッチな構造化イベントを推論します：センサー読み取り値とタイムスタンプおよびベクトル埋め込み、診断ログとエラーコードおよび音声スニペット、または位置、速度、およびシーンのコンテキストを含むトリップセグメントなどです。これらには、ネストされたデータのネイティブな取り込みと検索をデータベースがサポートする必要があります。

Zilliz Cloudは構造体の配列を導入し、配列内の各構造体はスカラーおよびベクトルを保持して、セマンティック整合性を維持する代わりに、ユーザーに原子的構造イベントをフラットなデータモデルに変換するよう求める従来の方法とは異なります。

## 構造体の配列の理由\{#why-array-of-structs}

現代のAIアプリケーション、自律走行車からマルチモーダル検索まで、ますますネストされた異種のデータに依存しています。従来のフラットなデータモデルは、「**1つの文書に複数の注釈付きチャンク**」や「**1つの運転シーンに複数の観測された操作**」のような複雑な関係性を表現するのに苦労します。ここでZilliz Cloudの構造体の配列データ型が活躍します。

構造体の配列により、スカラーおよびベクトル埋め込みの独自の組み合わせを含む順序付き構造化要素セットを保存できます。これにより、以下に最適です：

- **階層データ**: 親エンティティと複数の子レコード（例：多くのテキストチャンクを持つ本、多くの注釈付きフレームを持つ動画など）。
- **マルチモーダル埋め込み**: 各構造体はテキスト埋め込みと画像埋め込みなど、複数のベクトルを保持し、メタデータを一緒に保持できます。
- **時系列または順序データ**: 配列フィールドの構造体は、時系列データやステップバイステップのイベントを自然に表します。

JSONの塊を格納したり、データを複数のコレクションに分割する従来の回避策とは異なり、構造体の配列はZilliz Cloud内でネイティブなスキーマ強制、ベクトルインデックス作成、効率的なストレージを提供します。

## スキーマ設計ガイドライン\{#schema-design-guidelines}

[検索のためのデータモデル設計](./schema-design-hands-on)で説明されたすべてのガイドラインに加えて、データモデル設計で構造体の配列を使用し始める前に、以下の点を検討する必要があります。

### 構造体スキーマを定義\{#define-the-struct-schema}

コレクションに配列フィールドを追加する前に、内部構造体スキーマを定義します。構造体の各フィールドは、明示的に型付けされ、スカラー（**VARCHAR**、**INT**、**BOOLEAN**など）またはベクトル（**FLOAT_VECTOR**）である必要があります。

検索または表示に使用するフィールドのみを含むように構造体スキーマをスリムに保つことをお勧めします。未使用のメタデータで肥大化させないようにしてください。

### 最大容量を慎重に設定\{#set-the-max-capacity-thoughtfully}

各配列フィールドには、各エンティティが保持できる要素の最大数を指定する属性があります。この値は、使用例の上限に基づいて設定します。たとえば、1つの文書につき1,000のテキストチャンク、または1つの運転シーンにつき100の操作などです。

値が高すぎるとメモリを無駄にし、配列フィールド内の構造体の最大数を計算する必要があります。

### 構造体内のベクトルフィールドにインデックスを設定\{#index-vector-fields-in-structs}

インデックス作成は、コレクション内のベクトルフィールドと構造体内で定義されたベクトルフィールドの両方に必須です。構造体内のベクトルフィールドには、`AUTOINDEX`をインデックスタイプとして、`MAX_SIM`シリーズをメトリックタイプとして使用する必要があります。

すべての適用可能な制限事項については、[制限事項](./undefined#limits)を参照してください。

## 実世界の例：自律走行のためのCoVLAデータセットのモデリング\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

[チューリングモーターズ](https://tur.ing/posts/s1QUA1uh)によって導入され、Winter Conference on Applications of Computer Vision (WACV) 2025で採択された包括的ビジョン・言語・行動（CoVLA）データセットは、自律走行におけるビジョン・言語・行動（VLA）モデルのトレーニングと評価のためのリッチな基盤を提供します。各データポイント（通常はビデオクリップ）には、生の視覚入力だけでなく、以下の項目を記述した構造化キャプションも含まれます：

- **自車の動作**（例：「対向車に譲路しながら左折」）、
- **検出されたオブジェクト**（例：先行車、歩行者、信号灯）、および
- フレームレベルの**シーンのキャプション**。

この階層的、マルチモーダルな性質により、構造体の配列機能に最適な候補となります。CoVLAデータセットの詳細については、[CoVLAデータセットウェブサイト](https://turingmotors.github.io/covla-ad/)を参照してください。

### ステップ1：データセットをコレクションスキーマにマッピング\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLAデータセットは、合計80時間以上の映像を含む10,000本のビデオクリップで構成される大規模マルチモーダル運転データセットです。フレームは20Hzのレートでサンプリングされ、各フレームには車両の状態に関する情報と検出されたオブジェクトの座標とともに詳細な自然言語キャプションがアノテーションされます。

データセット構造は以下の通りです：

```python
├── video_1                                       (VIDEO) # video.mp4
│   ├── video_id                                  (INT)
│   ├── video_url                                 (STRING)
│   ├── frames                                    (ARRAY)
│   │   ├── frame_1                               (STRUCT)
│   │   │   ├── caption                           (STRUCT) # captions.jsonl
│   │   │   │   ├── plain_caption                 (STRING)
│   │   │   │   ├── rich_caption                  (STRING)
│   │   │   │   ├── risk                          (STRING)
│   │   │   │   ├── risk_correct                  (BOOL)
│   │   │   │   ├── risk_yes_rate                 (FLOAT)
│   │   │   │   ├── weather                       (STRING)
│   │   │   │   ├── weather_rate                  (FLOAT)
│   │   │   │   ├── road                          (STRING)
│   │   │   │   ├── road_rate                     (FLOAT)
│   │   │   │   ├── is_tunnel                     (BOOL)
│   │   │   │   ├── is_tunnel_yes_rate            (FLOAT)
│   │   │   │   ├── is_highway                    (BOOL)
│   │   │   │   ├── is_highway_yes_rate           (FLOAT)
│   │   │   │   ├── has_pedestrain                (BOOL)
│   │   │   │   ├── has_pedestrain_yes_rate       (FLOAT)
│   │   │   │   ├── has_carrier_car               (BOOL)
│   │   │   ├── traffic_light                     (STRUCT) # traffic_lights.jsonl
│   │   │   │   ├── index                         (INT)
│   │   │   │   ├── class                         (STRING)
│   │   │   │   ├── bbox                          (LIST<FLOAT>)
│   │   │   ├── front_car                         (STRUCT) # front_cars.jsonl
│   │   │   │   ├── has_lead                      (BOOL)
│   │   │   │   ├── lead_prob                     (FLOAT)
│   │   │   │   ├── lead_x                        (FLOAT)
│   │   │   │   ├── lead_y                        (FLOAT)
│   │   │   │   ├── lead_speed_kmh                (FLOAT)
│   │   │   │   ├── lead_a                        (FLOAT)
│   │   ├── frame_2                               (STRUCT)
│   │   ├── ...                                   (STRUCT)
│   │   ├── frame_n                               (STRUCT)
├── video_2
├── ...
├── video_n
```

CoVLAデータセットの構造が非常に階層的であり、収集されたデータを複数の`.jsonl`ファイルと`.mp4`形式のビデオクリップに分割していることがわかります。

Zilliz Cloudでは、JSONフィールドまたは構造体の配列フィールドを使用して、コレクションスキーマ内でネストされた構造を作成できます。ベクトル埋め込みがネスト形式の一部である場合、構造体の配列フィールドのみがサポートされます。ただし、配列内の構造体はそれ自体がネストされた構造を含むことはできません。CoVLAデータセットを保存しながら重要な関係性を維持するには、不要な階層を削除し、Zilliz Cloudコレクションスキーマに適合するようにデータをフラット化する必要があります。

以下の図は、次のスキーマでモデル化できるこのデータセットの構造を示しています：

![PATjwyoKzhPELnb14kBcnAEAnGv](/img/PATjwyoKzhPELnb14kBcnAEAnGv.png)

上記の図は、現在のビデオクリップの構造を示し、以下のようなフィールドで構成されます：

- `video_id`は主キーとして機能し、INT64型の整数を受け入れます。
- `states`は現在のビデオの各フレームにおける自車の状態を含む生JSON本文です。
- `captions`は構造体の配列で、各構造体には以下のフィールドがあります：
    - `frame_id`は現在のビデオ内の特定のフレームを識別します。
    - `plain_caption`は天気や道路状況などの周囲環境を含まない現在のフレームの説明であり、`plain_cap_vector`は対応するベクトル埋め込みです。
    - `rich_caption`は周囲環境を含む現在のフレームの説明であり、`rich_cap_vector`は対応するベクトル埋め込みです。
    - `risk`は自車が現在のフレームで直面するリスクの説明であり、`risk_vector`は対応するベクトル埋め込みです。
    - その他のフレーム属性（`road`、`weather`、`is_tunnel`、`has_pedestrain`など）。
- `traffic_lights`は現在のフレームで識別されたすべての交通信号を含むJSON本文です。
- `front_cars`は現在のフレームで識別されたすべての先行車を含む構造体の配列でもあります。

### ステップ2：スキーマを初期化\{#step-2-initialize-the-schemas}

まず、キャプション構造体、先行車構造体、コレクションのスキーマを初期化する必要があります。

- キャプション構造体のスキーマを初期化します。

    ```python
    client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

    # キャプション構造体のスキーマを作成
    schema_for_caption = client.create_struct_field_schema()

    schema_for_caption.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="自車の動作に属するフレームID"
    )

    schema_for_caption.add_field(
        field_name="plain_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車の動作のプレーンな説明"
    )

    schema_for_caption.add_field(
        field_name="plain_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車の動作のプレーンな説明のベクトル"
    )

    schema_for_caption.add_field(
        field_name="rich_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車の動作のリッチな説明"
    )

    schema_for_caption.add_field(
        field_name="rich_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車の動作のリッチな説明のベクトル"
    )

    schema_for_caption.add_field(
        field_name="risk",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車のリスクの説明"
    )

    schema_for_caption.add_field(
        field_name="risk_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車のリスクの説明のベクトル"
    )

    schema_for_caption.add_field(
        field_name="risk_correct",
        datatype=DataType.BOOL,
        description="リスク評価が正しいかどうか"
    )

    schema_for_caption.add_field(
        field_name="risk_yes_rate",
        datatype=DataType.FLOAT,
        description="リスクが存在する確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="weather",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="天気状況"
    )

    schema_for_caption.add_field(
        field_name="weather_rate",
        datatype=DataType.FLOAT,
        description="天気状況の確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="road",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="道路タイプ"
    )

    schema_for_caption.add_field(
        field_name="road_rate",
        datatype=DataType.FLOAT,
        description="道路タイプの確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="is_tunnel",
        datatype=DataType.BOOL,
        description="道路がトンネルかどうか"
    )

    schema_for_caption.add_field(
        field_name="is_tunnel_yes_rate",
        datatype=DataType.FLOAT,
        description="道路がトンネルである確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="is_highway",
        datatype=DataType.BOOL,
        description="道路が高速道路かどうか"
    )

    schema_for_caption.add_field(
        field_name="is_highway_yes_rate",
        datatype=DataType.FLOAT,
        description="道路が高速道路である確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="has_pedestrian",
        datatype=DataType.BOOL,
        description="歩行者が存在するかどうか"
    )

    schema_for_caption.add_field(
        field_name="has_pedestrian_yes_rate",
        datatype=DataType.FLOAT,
        description="歩行者が存在する確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="has_carrier_car",
        datatype=DataType.BOOL,
        description="商用車が存在するかどうか"
    )
    ```

- 先行車構造体のスキーマを初期化します

    <Admonition type="info" icon="📘" title="ノート">

    <p>先行車にはベクトル埋め込みが含まれませんが、データサイズがJSONフィールドの最大値を超えるため、構造体の配列として含める必要があります。</p>

    </Admonition>

    ```python
    schema_for_front_car = client.create_struct_field_schema()

    schema_for_front_car.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="自車の動作に属するフレームID"
    )

    schema_for_front_car.add_field(
        field_name="has_lead",
        datatype=DataType.BOOL,
        description="先行車が存在するかどうか"
    )

    schema_for_front_car.add_field(
        field_name="lead_prob",
        datatype=DataType.FLOAT,
        description="先行車が存在する確率/信頼度"
    )
    ```