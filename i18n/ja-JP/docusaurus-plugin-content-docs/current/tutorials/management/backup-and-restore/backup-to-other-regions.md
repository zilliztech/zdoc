---
title: "クロスリージョンバックアップ | Cloud"
slug: /backup-to-other-regions
sidebar_label: "クロスリージョンバックアップ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン単位の障害に対する保護を提供し、局所的な障害によるリスクを最小化することで、ディザスタリカバリ、ビジネス継続性、高可用性をサポートします。 | Cloud"
type: origin
token: ESVGwTkn8iLfUakSSrkc5dWJnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスリージョンバックアップ

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical（SaaS）でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンとすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン単位の障害に対する保護を提供し、局所的な障害によるリスクを最小化することで、ディザスタリカバリ、ビジネス継続性、高可用性をサポートします。

このガイドでは、Zilliz Cloud でクロスリージョンバックアップを使用する方法を説明します。 

## 制限事項\{#limits}

- **アクセス制御**: **project admin**、**organization owner** であるか、バックアップ権限を持つ **custom role** を持っている必要があります。

- **バックアップから除外される項目**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - クラスターの動的スケーリング設定とスケジュールスケーリング設定

- **クラスターのシャード設定**: バックアップされますが、CU あたりのシャード数の制限により、復元時にクラスターの CU サイズが縮小されると調整される場合があります。詳細については、[Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限事項**: クロスリージョンバックアップのコピージョブは、元のバックアップジョブが完了した後に開始されます。

## 手順\{#procedures}

クロスリージョンバックアップは、[手動でバックアップを作成する](./create-backup) とき、または [自動バックアップをスケジュールする](./schedule-automatic-backups) ときに有効にできます。

- **手動バックアップ:** 手動作成時にクロスリージョンバックアップを選択すると、コピーされたすべてのバックアップは永久に保持されます。

- **スケジュールバックアップ:** スケジュールバックアップ時にクロスリージョンバックアップを選択する場合は、各リージョンでコピーされたバックアップファイルの保持期間を設定する必要があります。

<Admonition type="info" title="Notes">

- リージョンは、元のリージョンと同じクラウドプロバイダーについてのみ選択できます。

</Admonition>

次のデモでは、手動でバックアップを作成する際にクロスリージョンバックアップを使用する方法を示します。自動バックアップのスケジュール設定中にクロスリージョンバックアップを使用する方法の詳細については、[自動バックアップのスケジュール](./schedule-automatic-backups) を参照してください。

<Supademo id="cmgkg6um62deokrn973s89qfx?utm_source=link" title=""  />

また、Zilliz Cloud RESTful API を使用して、ターゲットクラスターと同じリージョンで作成されたバックアップのクロスリージョンコピーを、次のように手動で作成することもできます。

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

出力は以下の通りです。

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

[ジョブ](./job-center) 一覧では、まず元のバックアップジョブが表示されます。これが完了すると、選択した各リージョンにバックアップファイルをコピーするための追加ジョブが表示され、リージョンごとに 1 件のレコードが作成されます。

## 課金への影響\{#billing-implications}

クロスリージョンバックアップを選択すると、2 種類の料金が適用される場合があります。

- **ストレージコスト:** コピーされたバックアップファイルが保存されるリージョンに基づきます。ストレージコストの計算方法を理解するには、[ストレージコスト](./storage-cost) を参照してください。

- **データ転送コスト:** ソースリージョンとターゲットリージョン間のトラフィックに基づきます。ストレージコストの計算方法を理解するには、[データ転送コスト](./data-transfer-cost) を参照してください。

詳細な料金については、[Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

### 例\{#example}

クラスターが **GCP us-west1（オレゴン）** にデプロイされており、このクラスターのバックアップファイルを 2 つの異なるリージョン、**GCP us-east4（米国バージニア）** と **GCP europe-west3（フランクフルト）** にコピーする必要があるとします。

- **元のバックアップファイルサイズ**: 20 GB

- **コピーされたバックアップの保持期間**: 1 か月

- **単価**: 

    - GCP のバックアップストレージの単価は **&#36;0.02/GB per month** です。

    - GCP us-west1（オレゴン）から GCP us-central1（アイオワ）へのデータ転送は、同一大陸内のクロスリージョン料金 **&#36;0.02/GB**.

    - GCP us-west1（オレゴン）から GCP europe-west3（フランクフルト）へのデータ転送は、異なる大陸間のクロスリージョン料金 **&#36;0.08/GB**.

コストの計算は以下の通りです。

- <strong>ストレージコスト:</strong> `20 GB × $0.02/GB per month × 1 month × 2 copies = $0.80`

- **データ転送コスト:** `(20 GB × $0.02/GB) + (20 GB × $0.08/GB) = $2.00`

- **合計コスト:** `$0.80 (storage) + $2.00 (data transfer) = $2.80`
