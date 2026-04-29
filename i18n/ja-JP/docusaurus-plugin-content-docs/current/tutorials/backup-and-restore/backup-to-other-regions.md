---
title: "クロスリージョンバックアップ | Cloud"
slug: /backup-to-other-regions
sidebar_key: backup-to-other-regions
sidebar_label: "クロスリージョンバックアップ"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。地域的な障害への対策として機能し、局所的な失敗によるリスクを最小限に抑えることで、ディザスタリカバリ、事業継続性、高可用性をサポートします。 | Cloud"
type: origin
token: ESVGwTkn8iLfUakSSrkc5dWJnye
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - ファイル
  - 表示

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスリージョンバックアップ

Zilliz Cloud におけるクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。これにより、リージョン全体の障害から保護し、局所的な失敗によるリスクを最小限に抑えることで、災害復旧、事業継続、高可用性をサポートします。

このガイドでは、Zilliz Cloud でクロスリージョンバックアップを使用する方法について説明します。

現在、Azure 上のクラスターはクロスリージョンバックアップをサポートしていません。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー** であるか、またはバックアップ権限を持つ **カスタムロール** を持っている必要があります。

- **バックアップから除外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` の パスワード（[リストア](./restore-from-snapshot) 中に新しい パスワード が生成されます）

    - クラスターの動的設定および スケジュールされたスケーリング 設定

- **クラスターシャード設定**: バックアップされますが、シャード数/CU 数の制限により、クラスターの CU サイズが縮小された場合、リストア時に調整される可能性があります。詳細については、[Zilliz Cloud 制限s](./limits#shards) を参照してください。

- **バックアップジョブの制限**: クロスリージョンバックアップコピージョブは、元のバックアップジョブが完了した後に開始されます。

## 手順\{#procedures}

クロスリージョンバックアップは、[手動でバックアップを作成する](./create-snapshot) 際、または [自動バックアップ をスケジュールする](./schedule-automatic-backups) 際に有効にできます。

- **手動バックアップ:** 手動作成時にクロスリージョンバックアップを選択した場合、コピーされたすべてのバックアップは永続的に保持されます。

- **スケジュールされたバックアップ:** スケジュールされたバックアップ時にクロスリージョンバックアップを選択した場合、各リージョン内のコピーされたバックアップファイルに対して保持期間を設定する必要があります。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>元のリージョンと同じクラウドプロバイダーのリージョンのみを選択できます。</li>
</ul>
<p></p>

</Admonition>

以下のデモでは、手動でバックアップを作成する際にクロスリージョンバックアップを使用する方法を示しています。自動バックアップ をスケジュールする際にクロスリージョンバックアップを使用する方法の詳細については、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

<Supademo id="cmgkg6um62deokrn973s89qfx?utm_source=link" title=""  />

また、Zilliz Cloud RESTful API を使用して、ターゲットクラスターと同じリージョンで作成されたバックアップのクロスリージョンコピーを手動で作成することもできます。方法は以下の通りです。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "backupType": "COLLECTION",
    "dbCollections": [
        {
            "dbName": "my_database",
            "collectionNames": [
                "collection_1",
                "collection_2"
            ]
        }
    ],
    "crossRegionCopies": [
        {
            "regionId": "aws-us-west-2"
        },
        {
            "regionId": "aws-us-east-1"
        }
    ]
}'
```

出力は以下のようになります。

```json
{
    "code": 0,
    "data": {
        "backupId": "backupx_xxxxxxxxxxxxxxx",
        "backupName": "Dedicated_01",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxxx"
    }
}
```

[ジョブ](./job-center) リストには、まず元のバックアップジョブが表示されます。このジョブが完了すると、選択した各リージョンに対してバックアップファイルをコピーするための追加のジョブが表示され、リージョンごとに1つのレコードが作成されます。

## 請求への影響\{#billing-implications}

クロスリージョンバックアップを選択した場合、以下の2種類の料金が発生する可能性があります。

- **ストレージコスト**: コピーされたバックアップファイルが保存されるリージョンに基づいて計算されます。ストレージコストの計算方法については、[ストレージコスト](./storage-cost) を参照してください。

- **データ転送料金**: ソースリージョンとターゲットリージョン間のトラフィックに基づいて計算されます。データ転送料金の計算方法については、[データ転送料金](./data-transfer-cost) を参照してください。

詳細な料金表については、[Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

### 例\{#example}

クラスターが **GCP us-west1 (オレゴン)** にデプロイされており、このクラスターのバックアップファイルを **GCP us-east4 (バージニア州、米国)** および **GCP europe-west3 (フランクフルト)** の2つの異なるリージョンにコピーする必要があると仮定します。

- **元のバックアップファイルサイズ**: 20 GB

- **コピーされたバックアップの保持期間**: 1か月

- **単価**:

    - GCP上のバックアップストレージの単価は **&#36;0.02/GB/月** です。

    - GCP us-west1 (オレゴン) から GCP us-central1 (アイオワ) へのデータ転送は、同一大陸内クロスリージョン料金として **&#36;0.02/GB** で課金されます。

    - GCP us-west1 (オレゴン) から GCP europe-west3 (フランクフルト) へのデータ転送は、異なる大陸間クロスリージョン料金として **&#36;0.08/GB** で課金されます。

以下にコストの計算を示します。

- **ストレージコスト**: `20 GB × $0.02/GB/月 × 1か月 × 2コピー = $0.80`

- **データ転送料金**: `(20 GB × $0.02/GB) + (20 GB × $0.08/GB) = $2.00`

- **合計コスト**: `$0.80 (ストレージ) + $2.00 (データ転送) = $2.80`

