---
title: "構造体の配列を使用したデータモデル設計 | BYOC"
slug: /schema-design-with-structs
sidebar_label: "構造体を使用したデータモデル"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "IoTや自動運転など、現代のAIアプリケーションは通常、センサー読み取り値とそのタイムスタンプおよびベクトル埋め込み、エラーコードと音声スニペットを含む診断ログ、または位置、速度、およびシーンコンテキストを含むトリップセグメントなど、豊かで構造化されたイベントを処理します。これらは、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることを求めます。 | BYOC"
type: origin
token: VOkIwd5adiziGQkoDO1cRoRFnre
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - スキーマ設計
  - 実践
  - 構造体
  - 構造体の配列
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルDB

---

import Admonition from '@theme/Admonition';


# 構造体の配列を使用したデータモデル設計

IoTや自動運転など、現代のAIアプリケーションは通常、センサー読み取り値とそのタイムスタンプおよびベクトル埋め込み、エラーコードと音声スニペットを含む診断ログ、または位置、速度、およびシーンコンテキストを含むトリップセグメントなど、豊かで構造化されたイベントを処理します。これらは、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることを求めます。

ユーザーにアトミックな構造的イベントをフラットなデータモデルに変換するよう要求する代わりに、Zilliz Cloudは構造体の配列を導入し、配列内の各構造体はスカラーとベクトルを保持して、セマンティック整合性を維持します。

## 構造体の配列の理由\{#why-array-of-structs}

自動運転からマルチモーダル検索に至るまで、現代のAIアプリケーションはますますネストされた異種データに依存しています。従来のフラットなデータモデルでは、「**1つのドキュメントに多数の注釈付きチャンク**」や「**1つの運転シーンに複数の観測された操作**」のような複雑な関係を表現するのが困難です。ここでZilliz Cloudの構造体の配列データ型が活躍します。

構造体の配列を使用すると、構造化要素の順序付きセットを保存でき、各構造体はスカラーフィールドとベクトル埋め込みの独自の組み合わせを含むことができます。これは以下に理想的です：

- **階層的データ**: 複数の子レコードを持つ親エンティティ、たとえば多くのテキストチャンクを持つ本や、多くの注釈付きフレームを持つビデオなど。

- **マルチモーダル埋め込み**: 各構造体は、テキスト埋め込みと画像埋め込みに加えてメタデータなど、複数のベクトルを保持できます。

- **時系列または順次データ**: 配列フィールド内の構造体は、時系列または段階的なイベントを自然に表します。

JSON blobを保存するか、データを複数のコレクションに分割する従来の回避策とは異なり、構造体の配列はZilliz Cloud内でネイティブなスキーマ強制、ベクトルインデックス、および効率的なストレージを提供します。

## スキーマ設計ガイドライン\{#schema-design-guidelines}

[検索のためのデータモデル設計](./schema-design-hands-on)で説明されているすべてのガイドラインに加えて、データモデル設計で構造体の配列を使用し始める前に、以下のことを検討する必要があります。

### 構造体スキーマの定義\{#define-the-struct-schema}

配列フィールドをコレクションに追加する前に、内部構造体スキーマを定義してください。構造体の各フィールドは明示的に型指定され、スカラー（**VARCHAR**、**INT**、**BOOLEAN**など）またはベクトル（**FLOAT_VECTOR**）でなければなりません。

検索または表示に使用するフィールドのみを含めることで、構造体スキーマをできるだけスリムに保つことをお勧めします。未使用のメタデータで肥大化させないでください。

### 最大容量を配慮して設定\{#set-the-max-capacity-thoughtfully}

各配列フィールドには、各エンティティが保持できる要素の最大数を指定する属性があります。使用ケースの上限に基づいて設定してください。たとえば、1つのドキュメントあたり1,000のテキストチャンク、または1つの運転シーンあたり100の操作などです。

値が高すぎるとメモリを無駄にし、配列フィールド内の構造体の最大数を計算する必要があります。

### 構造体内のベクトルフィールドのインデックス\{#index-vector-fields-in-structs}

ベクトルフィールドにはコレクション内のベクトルフィールドと構造体内で定義されたベクトルフィールドの両方を含む、インデックス作成が必須です。構造体内のベクトルフィールドには、インデックスタイプとして`AUTOINDEX`、メトリックタイプとして`MAX_SIM`シリーズを使用する必要があります。

すべての適用可能な制限事項の詳細については、[制限事項](./use-array-of-structs#limits)を参照してください。

## 実際の例：自動運転のためのCoVLAデータセットのモデリング\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

[Turing Motors](https://tur.ing/posts/s1QUA1uh)が導入し、Winter Conference on Applications of Computer Vision (WACV) 2025で採択されたComprehensive Vision-Language-Action (CoVLA)データセットは、自動運転におけるVision-Language-Action (VLA)モデルのトレーニングと評価のための豊かな基盤を提供します。通常はビデオクリップである各データポイントには、生の視覚入力だけでなく、以下の説明を含む構造化キャプションも含まれています：

- **自車の動作**（例：「対向交通に譲りながら左に合流」）、

- **検出されたオブジェクト**（例：先導車、歩行者、信号機）、

- フレームレベルの**シーンのキャプション**。

この階層的・マルチモーダルな特性により、構造体の配列機能に理想的な候補となります。CoVLAデータセットの詳細については、[CoVLAデータセットウェブサイト](https://turingmotors.github.io/covla-ad/)を参照してください。

### ステップ1: データセットをコレクションスキーマにマッピング\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLAデータセットは、10,000のビデオクリップで構成される大規模・マルチモーダル運転データセットで、合計80時間以上の映像を含みます。20Hzのレートでフレームをサンプリングし、各フレームに詳細な自然言語キャプションに加えて、車両状態と検出されたオブジェクトの座標情報を付与します。

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

CoVLAデータセットの構造は非常に階層的で、収集されたデータを複数の`.jsonl`ファイルと`.mp4`形式のビデオクリップに分割していることがわかります。

Zilliz Cloudでは、JSONフィールドまたは構造体の配列フィールドのいずれかを使用して、コレクションスキーマ内にネストされた構造を作成できます。ベクトル埋め込みがネストされた形式の一部である場合、構造体の配列フィールドのみがサポートされます。ただし、配列内の構造体自体がさらにネストされた構造を含むことはできません。CoVLAデータセットを保存しつつ基本的な関係を維持するには、不要な階層を削除し、データをフラット化してZilliz Cloudコレクションスキーマに適合させる必要があります。

以下の図は、以下のスキーマで示したモデルのデータセットをどのようにモデル化できるかを示しています：

![PATjwyoKzhPELnb14kBcnAEAnGv](/img/PATjwyoKzhPELnb14kBcnAEAnGv.png)

上記の図は、以下のフィールドから構成されるビデオクリップの構造を示しています：

- `video_id`は主キーとして機能し、INT64型の整数を受け入れます。

- `states`は、現在のビデオの各フレームにおける自車の状態を含む生のJSONボディです。

- `captions`は、各構造体が以下のフィールドを持つ構造体の配列です：

    - `frame_id`は、現在のビデオ内の特定のフレームを識別します。

    - `plain_caption`は、天気、道路状況など周囲の環境なしの現在のフレームの記述で、`plain_cap_vector`は対応するベクトル埋め込みです。

    - `rich_caption`は、周囲の環境を含む現在のフレームの記述で、`rich_cap_vector`は対応するベクトル埋め込みです。

    - `risk`は、自車が現在のフレームで直面するリスクの記述で、`risk_vector`は対応するベクトル埋め込みです。

    - `road`、`weather`、`is_tunnel`、`has_pedestrain`などのフレームの他のすべての属性。

- `traffic_lights`は、現在のフレームで識別されたすべての信号機信号を含むJSONボディです。

- `front_cars`は、現在のフレームで識別されたすべての先導車を含む構造体の配列です。

### ステップ2: スキーマの初期化\{#step-2-initialize-the-schemas}

まず、キャプション構造体、先導車構造体、コレクションのスキーマを初期化する必要があります。

- キャプション構造体のスキーマを初期化します。

    ```python
    client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

    # キャプション構造体のスキーマを作成
    schema_for_caption = client.create_struct_field_schema()

    schema_for_caption.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="自車の動作が属するフレームのID"
    )

    schema_for_caption.add_field(
        field_name="plain_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車の動作の簡潔な記述"
    )

    schema_for_caption.add_field(
        field_name="plain_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車の動作の簡潔な記述に対応するベクトル"
    )

    schema_for_caption.add_field(
        field_name="rich_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車の動作の詳細な記述"
    )

    schema_for_caption.add_field(
        field_name="rich_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車の動作の詳細な記述に対応するベクトル"
    )

    schema_for_caption.add_field(
        field_name="risk",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="自車のリスク記述"
    )

    schema_for_caption.add_field(
        field_name="risk_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="自車のリスク記述に対応するベクトル"
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
        description="歩行者存在の確率/信頼度"
    )

    schema_for_caption.add_field(
        field_name="has_carrier_car",
        datatype=DataType.BOOL,
        description="運搬車が存在するかどうか"
    )
    ```

- 先導車構造体のスキーマを初期化します。

    <Admonition type="info" icon="📘" title="注意">

    <p>先導車にはベクトル埋め込みが含まれていませんが、データサイズがJSONフィールドの最大値を超えるため、構造体の配列として含める必要があります。</p>

    </Admonition>

    ```python
    schema_for_front_car = client.create_struct_field_schema()

    schema_for_front_car.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="自車の動作が属するフレームのID"
    )

    schema_for_front_car.add_field(
        field_name="has_lead",
        datatype=DataType.BOOL,
        description="先導車が存在するかどうか"
    )

    schema_for_front_car.add_field(
        field_name="lead_prob",
        datatype=DataType.FLOAT,
        description="先導車の存在確率/信頼度"
    )

    schema_for_front_car.add_field(
        field_name="lead_x",
        datatype=DataType.FLOAT,
        description="自車に対する先導車の相対的なx位置"
    )

    schema_for_front_car.add_field(
        field_name="lead_y",
        datatype=DataType.FLOAT,
        description="自車に対する先導車の相対的なy位置"
    )

    schema_for_front_car.add_field(
        field_name="lead_speed_kmh",
        datatype=DataType.FLOAT,
        description="先導車のkm/h単位の速度"
    )

    schema_for_front_car.add_field(
        field_name="lead_a",
        datatype=DataType.FLOAT,
        description="先導車の加速度"
    )
    ```

- コレクションのスキーマを初期化します。

    ```python
    schema = client.create_schema()

    schema.add_field(
        field_name="video_id",
        datatype=DataType.VARCHAR,
        description="主キー",
        max_length=16,
        is_primary=True,
        auto_id=False
    )

    schema.add_field(
        field_name="video_url",
        datatype=DataType.VARCHAR,
        max_length=512,
        description="ビデオのURL"
    )

    schema.add_field(
        field_name="captions",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_caption,
        max_capacity=600,
        description="現在のビデオのキャプション"
    )

    schema.add_field(
        field_name="traffic_lights",
        datatype=DataType.JSON,
        description="現在のビデオで識別されたフレーム固有の信号機"
    )

    schema.add_field(
        field_name="front_cars",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_front_car,
        max_capacity=600,
        description="現在のビデオで識別されたフレーム固有の先導車"
    )
    ```

### ステップ3: インデックスパラメータの設定\{#step-3-set-index-parameters}

すべてのベクトルフィールドにはインデックスが必要です。要素構造体内のベクトルフィールドにインデックスを付けるには、インデックスタイプとして`AUTOINDEX`、埋め込みリスト間の類似性を測定するメトリックタイプとして`MAX_SIM`シリーズを使用する必要があります。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="captions[plain_cap_vector]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
    index_name="captions_plain_cap_vector_idx", # 現在は必須
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[rich_cap_vector]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
    index_name="captions_rich_cap_vector_idx", # 現在は必須
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[risk_vector]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
    index_name="captions_risk_vector_idx", # 現在は必須
    index_params={"M": 16, "efConstruction": 200}
)
```

これらのフィールド内でフィルタリングを高速化するために、JSONフィールドにJSONシャレディングを有効にすることをお勧めします。

### ステップ4: コレクションの作成\{#step-4-create-a-collection}

スキーマとインデックスの準備ができたら、以下のように対象コレクションを作成できます：

```python
client.create_collection(
    collection_name="covla_dataset",
    schema=schema,
    index_params=index_params
)
```

### ステップ5: データの挿入\{#step-5-insert-the-data}

Turing Motosは、CoVLAデータセットを生のビデオクリップ（`.mp4`）、状態（`states.jsonl`）、キャプション（`captions.jsonl`）、信号機（`traffic_lights.jsonl`）、および先導車（`front_cars.jsonl`）を含む複数のファイルに整理しています。

これらのファイルから各ビデオクリップのデータピースをマージし、データを挿入する必要があります。以下は、特定のビデオクリップのデータピースをマージするスクリプトです。

```python
import json
from openai import OpenAI

openai_client = OpenAI(
    api_key='YOUR_OPENAI_API_KEY',
)

video_id = "0a0fc7a5db365174" # 600フレームの単一ビデオを表します

# 指定したビデオクリップ内のすべての先導車レコードを取得
entries = []
front_cars = []
with open('data/front_car/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

for entry in entries:
    for key, value in entry.items():
        value['frame_id'] = int(key)
        front_cars.append(value)

# 指定したビデオクリップ内で識別されたすべての交通信号機を取得
entries = []
traffic_lights = []
frame_id = 0
with open('data/traffic_lights/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

for entry in entries:
    for key, value in entry.items():
        if not value or (value['index'] == 1 and key != '0'):
            frame_id+=1

        if value:
            value['frame_id'] = frame_id
            traffic_lights.append(value)
        else:
            value_dict = {}
            value_dict['frame_id'] = frame_id
            traffic_lights.append(value_dict)

# ビデオクリップで生成されたすべてのキャプションを取得し、ベクトル埋め込みに変換
entries = []
captions = []
with open('data/captions/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

def get_embedding(text, model="embeddinggemma:latest"):
    response = openai_client.embeddings.create(input=text, model=model)
    return response.data[0].embedding

# 各エントリに埋め込みを追加
for entry in entries:
    # 各エントリは単一のキー（例：'0', '1', ...）を持つ辞書です
    for key, value in entry.items():
        value['frame_id'] = int(key)  # キーを整数に変換しframe_idに割り当て

        if "plain_caption" in value and value["plain_caption"]:
            value["plain_cap_vector"] = get_embedding(value["plain_caption"])
        if "rich_caption" in value and value["rich_caption"]:
            value["rich_cap_vector"] = get_embedding(value["rich_caption"])
        if "risk" in value and value["risk"]:
            value["risk_vector"] = get_embedding(value["risk"])

        captions.append(value)

data = {
    "video_id": video_id,
    "video_url": "https://your-storage.com/{}".format(video_id),
    "captions": captions,
    "traffic_lights": traffic_lights,
    "front_cars": front_cars
}
```

データを適切に処理したら、以下のように挿入できます：

```python
client.insert(
    collection_name="covla_dataset",
    data=[data]
)

# {'insert_count': 1, 'ids': ['0a0fc7a5db365174'], 'cost': 0}
```
