---
title: "構造体の配列によるデータモデル設計 | BYOC"
slug: /schema-design-with-structs
sidebar_key: schema-design-with-structs
sidebar_label: "構造体を用いたデータモデル"
beta: FALSE
notebook: FALSE
description: "現代の AI アプリケーション、特にモノのインターネット (IoT) や自動運転では、タイムスタンプとベクトル埋め込みを含むセンサー測定値、エラーコードと音声スニペットを含む診断ログ、または位置・速度・シーンコンテキストを含む移動セグメントなど、リッチで構造化されたイベントに対して推論を行うのが一般的です。これらには、ネストされたデータの取り込みと検索をネイティブにサポートするデータベースが必要です。| BYOC"
type: origin
token: VOkIwd5adiziGQkoDO1cRoRFnre
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - スキーマ
  - スキーマ設計
  - ハンズオン
  - 構造体
  - 構造体の配列

---

import Admonition from '@theme/Admonition';


# 配列の構造体によるデータモデル設計

モノのインターネット（IoT）や自動運転といった現代のAIアプリケーションでは、通常、豊かな構造化イベント（例：タイムスタンプとベクトル埋め込みを含むセンサー読み取り値、エラーコードと音声スニペットを含む診断ログ、位置情報・速度・シーンコンテキストを含むトリップセグメントなど）に基づいて推論を行います。このような用途では、データベースがネストされたデータの取り込みおよび検索をネイティブにサポートする必要があります。

ユーザーに原子的な構造的イベントをフラットなデータモデルに変換させる代わりに、Zilliz Cloudは「配列の構造体（配列 of 構造体s）」を導入しました。この機能により、配列内の各構造体（構造体）がスカラーフィールドとベクトルフィールドを保持でき、意味的な整合性を維持します。

## なぜ配列の構造体なのか\{#why-array-of-structs}

自動運転からマルチモーダル検索に至るまで、現代のAIアプリケーションはますますネストされた異種データに依存しています。従来のフラットなデータモデルでは、「1つのドキュメントに多数の注釈付きチャンクが含まれる」や「1つの運転シーンに複数の観測されたマニューバーが含まれる」といった複雑な関係性を表現することが困難です。ここで、Zilliz Cloudの「配列の構造体」データ型がその真価を発揮します。

配列の構造体を使用すると、順序付きの構造化要素セットを格納できます。各構造体（構造体）には、独自のスカラーフィールドとベクトル埋め込みの組み合わせを含めることができます。これは以下のようなケースに最適です。

- **階層データ**: 親エンティティと複数の子レコードを持つケース。例：多数のテキストチャンクを持つ書籍、多数の注釈付きフレームを持つ動画。

- **マルチモーダル埋め込み**: 各構造体が複数のベクトル（例：テキスト埋め込み＋画像埋め込み）とメタデータを保持可能。

- **時系列データまたはシーケンシャルデータ**: 配列フィールド内の構造体が、自然に時系列またはステップごとのイベントを表現。

JSON形式のBLOBとして保存したり、複数のコレクションにデータを分割するといった従来の回避策とは異なり、「配列の構造体」はZilliz Cloud内でネイティブなスキーマ強制、ベクトルインデックス作成、効率的なストレージを提供します。

## スキーマ設計ガイドライン\{#schema-design-guidelines}

[検索のためのデータモデル設計](./schema-design-hands-on)で説明されているすべてのガイドラインに加えて、データモデル設計で「配列の構造体」を使用する前に、以下の点も考慮してください。

### 構造体のスキーマを定義する\{#define-the-struct-schema}

コレクションに配列フィールドを追加する前に、内部の構造体（構造体）スキーマを定義してください。構造体内の各フィールドは、明示的に型指定する必要があります。スカラー（**VARCHAR**, **INT**, **BOOLEAN** など）またはベクトル（**FLOAT_VECTOR**）のいずれかです。

検索または表示に使用するフィールドのみを含めて、構造体スキーマをシンプルに保つことを推奨します。未使用のメタデータで肥大化させないでください。

### 最大容量を慎重に設定する\{#set-the-max-capacity-thoughtfully}

各配列フィールドには、各エンティティがその配列フィールドに保持できる最大要素数を指定する属性があります。ユースケースにおける上限に基づいてこの値を設定してください。たとえば、1ドキュメントあたり1,000個のテキストチャンク、または1つの運転シーンあたり100個のマニューバーなどです。

過度に高い値を設定するとメモリが無駄になるため、配列フィールド内の構造体の最大数を事前に計算しておく必要があります。

### 構造体のベクトルフィールドにインデックスを作成する\{#index-vector-fields-in-structs}

ベクトルフィールドにはインデックス作成が必須です。コレクション内のベクトルフィールドだけでなく、構造体内で定義されたベクトルフィールドにも適用されます。構造体内のベクトルフィールドには、インデックスタイプとして `AUTOINDEX` を、メトリックタイプとして `MAX_SIM` シリーズを使用する必要があります。

適用可能なすべての制限の詳細については、[制限事項](./use-array-of-structs#limits)を参照してください。

## 実世界の例：自動運転向けCoVLAデータセットのモデリング\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

[Turing Motors](https://tur.ing/posts/s1QUA1uh) によって発表され、2025年のWinter Conference on アプリケーション of Computer Vision (WACV) で採択されたComprehensive Vision-言語-Action (CoVLA) データセットは、自動運転におけるVision-言語-Action (VLA) モデルのトレーニングおよび評価のための豊かな基盤を提供します。各データポイント（通常はビデオクリップ）には、生の視覚入力だけでなく、次のような構造化キャプションも含まれています。

- **自車両の挙動**（例：「対向車に譲りながら左に合流」）

- **検出されたオブジェクト**（例：先行車、歩行者、信号機）

- フレームレベルのシーン**キャプション**

このような階層的かつマルチモーダルな性質は、「配列の構造体」機能に非常に適しています。CoVLAデータセットの詳細については、[CoVLA データセット Website](https://turingmotors.github.io/covla-ad/) を参照してください。

### ステップ1: データセットをコレクションスキーマにマッピングする\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLAデータセットは、10,000件のビデオクリップからなる大規模マルチモーダル運転データセットであり、合計80時間以上の映像を含みます。このデータセットは20Hzのレートでフレームをサンプリングし、各フレームに詳細な自然言語キャプション、車両状態情報、検出されたオブジェクトの座標を付与しています。

データセットの構造は次のとおりです：

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

CoVLA データセットの構造は非常に階層的であり、収集されたデータが複数の `.jsonl` ファイルに分割され、`.mp4` 形式のビデオクリップとともに提供されていることがわかります。

Zilliz Cloud では、コレクションスキーマ内でネストされた構造を作成するために、JSON フィールドまたは 配列-of-構造体s フィールドのいずれかを使用できます。ベクトル埋め込みがネスト形式の一部である場合、配列-of-構造体s フィールドのみがサポートされます。ただし、配列内の 構造体 自体はさらにネストされた構造を含むことはできません。CoVLA データセットを格納しつつ重要な関係性を保持するには、不要な階層を削除し、データをフラット化して Zilliz Cloud のコレクションスキーマに適合させる必要があります。

以下の図は、次に示すスキーマを使ってこのデータセットをどのようにモデル化できるかを示しています。

![PATjwyoKzhPELnb14kBcnAEAnGv](https://zdoc-images.s3.us-west-2.amazonaws.com/PATjwyoKzhPELnb14kBcnAEAnGv.png)

上記の図は、ビデオクリップの構造を示しており、次のフィールドで構成されています。

- `video_id` は主キーとして機能し、INT64 型の整数を受け入れます。

- `states` は、現在のビデオの各フレームにおけるエゴ車両の状態を含む生の JSON 本体です。

- `captions` は 構造体 の配列（配列 of 構造体s）であり、各 構造体 は以下のフィールドを持ちます：

    - `frame_id` は、現在のビデオ内の特定のフレームを識別します。

    - `plain_caption` は、天候や道路状況などの周辺環境を含まない現在のフレームの説明であり、`plain_cap_vector` はその対応するベクトル埋め込みです。

    - `rich_caption` は、周辺環境を含んだ現在のフレームの説明であり、`rich_cap_vector` はその対応するベクトル埋め込みです。

    - `risk` は、現在のフレームでエゴ車両が直面するリスクの説明であり、`risk_vector` はその対応するベクトル埋め込みです。

    - その他のフレーム属性（例：`road`、`weather`、`is_tunnel`、`has_pedestrain` など）すべて。

- `traffic_lights` は、現在のフレームで検出されたすべての信号機情報を含む JSON 本体です。

- `front_cars` も同様に 構造体 の配列（配列 of 構造体s）であり、現在のフレームで検出された前方走行車両をすべて含みます。

### ステップ 2: スキーマの初期化\{#step-2-initialize-the-schemas}

まず、caption 構造体、front_cars 構造体、およびコレクションのスキーマを初期化する必要があります。

- Caption 構造体 のスキーマを初期化します。

    ```python
    client = MilvusClient("YOUR_CLUSTER_ENDPOINT")
    
    # create the schema for the caption struct
    schema_for_caption = client.create_struct_field_schema()
    
    schema_for_caption.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="ID of the frame to which the ego vehicle's behavior belongs"
    )
    
    schema_for_caption.add_field(
        field_name="plain_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="plain description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="plain_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the plain description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="rich_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="rich description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="rich_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the rich description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="risk",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="description of the ego vehicle's risks"
    )
    
    schema_for_caption.add_field(
        field_name="risk_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the description of the ego vehicle's risks"
    )
    
    schema_for_caption.add_field(
        field_name="risk_correct",
        datatype=DataType.BOOL,
        description="whether the risk assessment is correct"
    )
    
    schema_for_caption.add_field(
        field_name="risk_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of risk being present"
    )
    
    schema_for_caption.add_field(
        field_name="weather",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="weather condition"
    )
    
    schema_for_caption.add_field(
        field_name="weather_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the weather condition"
    )
    
    schema_for_caption.add_field(
        field_name="road",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="road type"
    )
    
    schema_for_caption.add_field(
        field_name="road_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road type"
    )
    
    schema_for_caption.add_field(
        field_name="is_tunnel",
        datatype=DataType.BOOL,
        description="whether the road is a tunnel"
    )
    
    schema_for_caption.add_field(
        field_name="is_tunnel_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road being a tunnel"
    )
    
    schema_for_caption.add_field(
        field_name="is_highway",
        datatype=DataType.BOOL,
        description="whether the road is a highway"
    )
    
    schema_for_caption.add_field(
        field_name="is_highway_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road being a highway"
    )
    
    schema_for_caption.add_field(
        field_name="has_pedestrian",
        datatype=DataType.BOOL,
        description="whether there is a pedestrian present"
    )
    
    schema_for_caption.add_field(
        field_name="has_pedestrian_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of pedestrian presence"
    )
    
    schema_for_caption.add_field(
        field_name="has_carrier_car",
        datatype=DataType.BOOL,
        description="whether there is a carrier car present"
    )
    ```

- Front Car 構造体のスキーマを初期化します

    <Admonition type="info" icon="📘" title="Notes">

    <p>フロントカーにはベクトル埋め込みが含まれませんが、データサイズが JSON フィールドの最大値を超えるため、構造体 の配列として含める必要があります。</p>

    </Admonition>

    ```python
    schema_for_front_car = client.create_struct_field_schema()
    
    schema_for_front_car.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="ID of the frame to which the ego vehicle's behavior belongs"
    )
    
    schema_for_front_car.add_field(
        field_name="has_lead",
        datatype=DataType.BOOL,
        description="whether there is a leading vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_prob",
        datatype=DataType.FLOAT,
        description="probability/confidence of the leading vehicle's presence"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_x",
        datatype=DataType.FLOAT,
        description="x position of the leading vehicle relative to the ego vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_y",
        datatype=DataType.FLOAT,
        description="y position of the leading vehicle relative to the ego vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_speed_kmh",
        datatype=DataType.FLOAT,
        description="speed of the leading vehicle in km/h"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_a",
        datatype=DataType.FLOAT,
        description="acceleration of the leading vehicle"
    )
    ```

- コレクションのスキーマを初期化する

    ```python
    schema = client.create_schema()
    
    schema.add_field(
        field_name="video_id",
        datatype=DataType.VARCHAR,
        description="primary key",
        max_length=16,
        is_primary=True,
        auto_id=False
    )
    
    schema.add_field(
        field_name="video_url",
        datatype=DataType.VARCHAR,
        max_length=512,
        description="URL of the video"
    )
    
    schema.add_field(
        field_name="captions",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_caption,
        max_capacity=600,
        description="captions for the current video"
    )
    
    schema.add_field(
        field_name="traffic_lights",
        datatype=DataType.JSON,
        description="frame-specific traffic lights identified in the current video"
    )
    
    schema.add_field(
        field_name="front_cars",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_front_car,
        max_capacity=600,
        description="frame-specific leading cars identified in the current video"
    )
    ```

### Step 3: Set index parameters\{#step-3-set-index-parameters}

すべてのベクトルフィールドはインデックスを作成する必要があります。要素構造体（構造体）内のベクトルフィールドをインデックスするには、インデックスタイプとして `AUTOINDEX` を使用し、埋め込みリスト間の類似度を測定するために `MAX_SIM` シリーズのメトリックタイプを使用する必要があります。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="captions[plain_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_plain_cap_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[rich_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_rich_cap_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[risk_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_risk_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)
```

JSONフィールド内でフィルタリングを高速化するには、JSONフィールドに対してJSONシュレッディングを有効にすることをお勧めします。

### Step 4: Create a collection\{#step-4-create-a-collection}

スキーマとインデックスの準備が完了したら、次のようにして対象のコレクションを作成できます。

```python
client.create_collection(
    collection_name="covla_dataset",
    schema=schema,
    index_params=index_params
)
```

### ステップ 5: データの挿入\{#step-5-insert-the-data}

Turing Motos は、CoVLA データセットを複数のファイルに分けて整理しています。これには、生のビデオクリップ（`.mp4`）、状態（`states.jsonl`）、キャプション（`captions.jsonl`）、信号機（`traffic_lights.jsonl`）、前方車両（`front_cars.jsonl`）が含まれます。

これらのファイルから各ビデオクリップに対応するデータ片をマージし、データを挿入する必要があります。以下は、特定のビデオクリップについてデータ片をマージするスクリプトです。

```python
import json
from openai import OpenAI

openai_client = OpenAI(
    api_key='YOUR_OPENAI_API_KEY',
)

video_id = "0a0fc7a5db365174" # represent a single video with 600 frames

# get all front car records in the specified video clip
entries = []
front_cars = []
with open('data/front_car/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

for entry in entries:
    for key, value in entry.items():
        value['frame_id'] = int(key)
        front_cars.append(value)

# get all traffic lights identified in the specified video clip
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

# get all captions generated in the video clip and convert them into vector embeddings
entries = []
captions = []
with open('data/captions/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

def get_embedding(text, model="embeddinggemma:latest"):
    response = openai_client.embeddings.create(input=text, model=model)
    return response.data[0].embedding

# Add embeddings to each entry
for entry in entries:
    # Each entry is a dict with a single key (e.g., '0', '1', ...)
    for key, value in entry.items():
        value['frame_id'] = int(key)  # Convert key to integer and assign to frame_id

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

データを適切に処理したら、次のように挿入できます。

```python
client.insert(
    collection_name="covla_dataset",
    data=[data]
)

# {'insert_count': 1, 'ids': ['0a0fc7a5db365174'], 'cost': 0}
```

