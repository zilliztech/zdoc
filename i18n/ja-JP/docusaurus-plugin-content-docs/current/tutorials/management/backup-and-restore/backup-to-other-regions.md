---
title: "クロスリージョンバックアップ | Cloud"
slug: /backup-to-other-regions
sidebar_label: "クロスリージョンバックアップ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン障害に対する保護を提供し、局所的な障害によるリスクを最小限に抑えることで、災害復旧、事業継続性、高可用性をサポートします。 | Cloud"
type: origin
token: ESVGwTkn8iLfUakSSrkc5dWJnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスリージョンバックアップ

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよびすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud のクロスリージョンバックアップは、バックアップを複数のクラウドリージョンにコピーすることでデータ保護を強化します。リージョン障害に対する保護を提供し、局所的な障害によるリスクを最小限に抑えることで、災害復旧、事業継続性、高可用性をサポートします。

このガイドでは、Zilliz Cloud でクロスリージョンバックアップを使用する方法を説明します。 

## 制限事項\{#limits}

- **アクセス制御**: **project admin**、**organization owner**、またはバックアップ権限を持つ **custom role** である必要があります。

- **バックアップ対象外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュールされたスケーリングの設定

- **クラスターシャード設定**: バックアップには含まれますが、クラスターの CU サイズが縮小された場合は、CU あたりのシャード数の制限により、復元時に調整されることがあります。詳細については、[Zilliz Cloud の制限事項](./limits#shards) を参照してください。

- **バックアップジョブの制限**: クロスリージョンバックアップのコピージョブは、元のバックアップジョブが完了した後に開始されます。

## 手順\{#procedures}

クロスリージョンバックアップは、[手動でバックアップを作成する](./create-backup)とき、または[自動バックアップをスケジュールする](./schedule-automatic-backups)ときに有効にできます。

- **手動バックアップ:** 手動作成時にクロスリージョンバックアップを選択すると、コピーされたすべてのバックアップは永久に保持されます。

- **スケジュールバックアップ:** スケジュールバックアップ時にクロスリージョンバックアップを選択する場合は、リージョンごとにコピーされたバックアップファイルの保持期間を設定する必要があります。

<Admonition type="info" title="Notes">

- リージョンは、元のリージョンと同じクラウドプロバイダーのものだけを選択できます。

</Admonition>

以下のデモでは、手動でバックアップを作成するときにクロスリージョンバックアップを使用する方法を説明します。自動バックアップのスケジュール時にクロスリージョンバックアップを使用する方法の詳細については、[自動バックアップのスケジュール設定](./schedule-automatic-backups)を参照してください。

<Supademo id="cmgkg6um62deokrn973s89qfx?utm_source=link" title=""  />

また、Zilliz Cloud RESTful API を使用して、ターゲットクラスターと同じリージョンに作成されたバックアップのクロスリージョンコピーを、次のように手動で作成することもできます。

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

[Jobs](./job-center) の一覧では、最初に元のバックアップジョブが表示されます。それが完了すると、選択した各リージョンにバックアップファイルをコピーする追加のジョブが表示され、リージョンごとに 1 件のレコードが作成されます。

## 課金への影響\{#billing-implications}

クロスリージョンバックアップを選択すると、2 種類の料金が発生する場合があります。

- **ストレージコスト:** コピーされたバックアップファイルが保存されるリージョンに基づきます。ストレージコストの計算方法については、[Storage Cost](./storage-cost) を参照してください。

- **データ転送コスト:** ソースリージョンとターゲットリージョン間のトラフィックに基づきます。ストレージコストの計算方法については、[Data Transfer Cost](./data-transfer-cost) を参照してください。

詳細な料金については、[Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

### 例\{#example}

ここで、クラスターが **GCP us-west1 (Oregon)** にデプロイされており、このクラスターのバックアップファイルを 2 つの異なるリージョン、**GCP us-east4 (Virginia, USA)** と **GCP europe-west3 (Frankfurt)** にコピーする必要があるとします。

- **元のバックアップファイルサイズ**: 20 GB

- **コピーされたバックアップの保持期間**: 1 か月

- **単価**: 

    - GCP のバックアップストレージの単価は **&#36;0.02/GB per month** です。

    - GCP us-west1 (Oregon) から GCP us-central1 (Iowa) へのデータ転送は、同一大陸内のクロスリージョン料金で課金され、その料金は **&#36;0.02/GB**.

    - GCP us-west1 (Oregon) から GCP europe-west3 (Frankfurt) へのデータ転送は、異なる大陸間のクロスリージョン料金で課金され、その料金は **&#36;0.08/GB**.

費用の計算は以下の通りです。

- <strong>ストレージコスト:</strong> `20 GB × $0.02/GB per month × 1 month × 2 copies = $0.80`

- **データ転送コスト:** `(20 GB × $0.02/GB) + (20 GB × $0.08/GB) = $2.00`

- **合計コスト:** `$0.80 (storage) + $2.00 (data transfer) = $2.80`
