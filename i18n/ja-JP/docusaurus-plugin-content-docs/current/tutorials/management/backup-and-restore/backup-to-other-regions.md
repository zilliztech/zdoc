---
title: "クロスリージョンバックアップ | Cloud"
slug: /backup-to-other-regions
sidebar_label: "クロスリージョンバックアップ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン障害に備え、局所的な障害によるリスクを最小限に抑えることで、災害復旧、事業継続性、高可用性を支援します。 | Cloud"
type: origin
token: ESVGwTkn8iLfUakSSrkc5dWJnye
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスリージョンバックアップ

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) と BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよびすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン障害に備え、局所的な障害によるリスクを最小限に抑えることで、災害復旧、事業継続性、高可用性を支援します。

このガイドでは、Zilliz Cloud でクロスリージョンバックアップを使用する方法を説明します。 

## 制限事項\{#limits}

- **アクセス制御**: **project admin**、**organization owner**、またはバックアップ権限を持つ **custom role** が必要です。

- **バックアップ対象外**:

    - Collection TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[restore](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - cluster の動的スケーリング設定およびスケジュール済みスケーリング設定

- **Cluster シャード設定**: バックアップされますが、cluster の CU サイズが縮小される場合、CU あたりのシャード数制限により restore 時に調整されることがあります。詳細は [Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限**: クロスリージョンバックアップのコピージョブは、元のバックアップジョブが完了した後に開始されます。

## 手順\{#procedures}

クロスリージョンバックアップは、[手動でバックアップを作成](./create-backup) する際、または [自動バックアップをスケジュール](./schedule-automatic-backups) する際に有効化できます。

- **手動バックアップ:** 手動作成時にクロスリージョンバックアップを選択した場合、コピーされたすべてのバックアップは永続的に保持されます。

- **スケジュールバックアップ:** スケジュールバックアップ時にクロスリージョンバックアップを選択した場合、各リージョン内のコピーされたバックアップファイルの保持期間を設定する必要があります。

<Admonition type="info" icon="📘" title="📘 Notes">

- 元のリージョンと同じクラウドプロバイダーのリージョンのみ選択できます。

</Admonition>

次のデモでは、手動でバックアップを作成するときにクロスリージョンバックアップを使用する方法を示します。自動バックアップのスケジュール時にクロスリージョンバックアップを使用する方法の詳細については、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

<Supademo id="cmgkg6um62deokrn973s89qfx?utm_source=link" title=""  />

次のように、Zilliz Cloud RESTful API を使用して、ターゲット cluster と同じリージョンに作成されたバックアップのクロスリージョンコピーを手動で作成することもできます。

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

出力は次のようになります。

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

[Jobs](./job-center) リストでは、最初に元のバックアップジョブが表示されます。これが完了すると、選択した各リージョンにバックアップファイルをコピーするための追加ジョブが表示され、リージョンごとに 1 件のレコードが作成されます。

## 課金への影響\{#billing-implications}

クロスリージョンバックアップを選択すると、2 種類の料金が発生する可能性があります。

- **ストレージコスト:** コピーされたバックアップファイルが保存されるリージョンに基づきます。ストレージコストの計算方法については、[Storage Cost](./storage-cost) を参照してください。

- **データ転送料:** ソースリージョンとターゲットリージョン間のトラフィックに基づきます。ストレージコストの計算方法については、[Data Transfer Cost](./data-transfer-cost) を参照してください。

詳細な料金については、[Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

### 例\{#example}

cluster が **GCP us-west1 (Oregon)** にデプロイされており、この cluster のバックアップファイルを **GCP us-east4 (Virginia, USA)** と **GCP europe-west3 (Frankfurt)** の 2 つの異なるリージョンにコピーする必要があるとします。

- **元のバックアップファイルサイズ**: 20 GB

- **コピーされたバックアップの保持期間**: 1 か月

- **単価**: 

    - GCP におけるバックアップストレージの単価は **&#36;0.02/GB per month** です。

    - GCP us-west1 (Oregon) から GCP us-central1 (Iowa) へのデータ転送は、同一大陸内クロスリージョン料金の **&#36;0.02/GB** で課金されます。

    - GCP us-west1 (Oregon) から GCP europe-west3 (Frankfurt) へのデータ転送は、異なる大陸間クロスリージョン料金の **&#36;0.08/GB** で課金されます。

コスト計算は次のとおりです。

- **ストレージコスト:** `20 GB × $0.02/GB per month × 1 month × 2 copies = $0.80`

- **データ転送料:** `(20 GB × $0.02/GB) + (20 GB × $0.08/GB) = $2.00`

- **合計コスト:** `$0.80 (storage) + $2.00 (data transfer) = $2.80`

