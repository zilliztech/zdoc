---
title: "ストレージコスト | Cloud"
slug: /storage-cost
sidebar_label: "ストレージ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターが稼働しているかどうかにかかわらず、データまたはバックアップファイルを保存するとストレージコストが発生します。 | Cloud"
type: origin
token: PNj2w5fY9ifr82kbX8ucKgXAn0r
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ストレージコスト

Zilliz Cloud では、クラスターが稼働しているかどうかにかかわらず、データまたはバックアップファイルを保存するとストレージコストが発生します。

## ストレージコストの発生源\{#sources-of-storage-costs}

以下のシナリオでストレージ料金が請求されます。

- Dedicated クラスター: Dedicated クラスターに保存されたデータ。

- Serverless クラスター: Serverless クラスターに保存されたデータ。

- [データベース](./database): オンデマンド検索に使用するデータベースに保存されたデータ。

    - 管理対象コレクション内のデータとインデックス。

    - 外部コレクション内のインデックス。

- [バックアップ](./create-backup)ストレージ: 災害復旧のために作成したバックアップファイル。

- [マネージドボリューム](./managed-volume)ストレージ: ボリュームに保存される構造化データ、または非構造化データファイルの集合。

## コスト計算\{#cost-calculation}

```plaintext
Storage Cost = Storage Unit Price x Data Size x Duration
```

- Storage Unit Price: クラウドリージョンとクラスタータイプによって決まります。詳細な料金については、[Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- Data Size: 保存されているすべてのデータのサイズ、またはバックアップファイルのサイズで、GB 単位で測定されます。

- Duration: データまたはバックアップファイルが Zilliz Cloud に保存される時間の長さ。

## 請求ルール\{#billing-rules}

クラスターおよびボリュームストレージの請求ルールは、バックアップストレージおよびコールドデータアクセスとはわずかに異なります。

- **Dedicated & Serverless Cluster, Volume, and Database Storage:** 時間単位で請求され、最低請求時間は 1 時間です。

- **Backup Storage:** 日単位で請求され、最低請求日数は 1 日です。

## 例\{#examples}

以下は、ストレージコストの計算方法を理解するための例です。

### 例 1: Dedicated クラスターのストレージコスト\{#example-1-dedicated-cluster-storage-cost}

ご利用中のサービングクラスターの構成が以下のとおりであるとします。

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Data Size**: 500 GB

- **Storage Duration**: 29 日 23 時間 30 分

Cloud Provider & Region、および Cluster Type の情報を基に、[Pricing Page](https://zilliz.com/pricing) でストレージ単価が **&#36;0.025/GB per month** であることを確認できます。

[請求ルール](./storage-cost#billing-rules)により、1 時間未満の端数は切り上げられて 1 時間として計算されます。ストレージ期間の 29 日 23 時間 30 分は 30 日に切り上げられ、これは 1 か月に相当します。

データストレージの合計コストは `$0.025 x 500 × 1 = $12.50` です。

### 例 2: バックアップストレージのコスト\{#example-2-backup-storage-cost}

クラスターの構成が以下のとおりであるとします。

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Backup File Size**: 20 GB

- **Backup File Retention Period**: 44 日 6 時間

Cloud Provider & Region、および Cluster Type の情報を基に、[Pricing Page](https://zilliz.com/pricing) でストレージ単価が **&#36;0.025/GB per month** であることを確認できます。

[請求ルール](./storage-cost#billing-rules)により、1 日未満の端数は切り上げられて 1 日として計算されます。そのため、保持期間の 44 日 6 時間は 45 日に切り上げられ、これは 1.5 か月に相当します。

この例のクラスターにおけるバックアップストレージの合計コストは `$0.025 x 20 x 1.5 = $0.75` です。

### 例 3: マネージドボリュームストレージのコスト\{#example-3-managed-volume-storage-cost}

インポートのためにボリュームに **10 GB** のデータをアップロードし、それを **1 か月** 保持した場合、単価が **&#36;0.04/GB per month** であれば、コストは `$0.04 × 10 × 1 = $0.40` です。

## FAQ\{#faqs}

1. **クラスターを一時停止した場合でもストレージ料金は請求されますか？**

    はい。クラスターが一時停止されていても、クラスターデータ、バックアップ、またはボリュームファイルが保持されている限り、ストレージコストが適用されます。

1. **ストレージには最低料金がありますか？**
 はい。ストレージには最低料金があります。

    - クラスターおよびボリュームストレージ: 最低 1 時間分の請求。

    - バックアップストレージ: 最低 1 日分の請求。

