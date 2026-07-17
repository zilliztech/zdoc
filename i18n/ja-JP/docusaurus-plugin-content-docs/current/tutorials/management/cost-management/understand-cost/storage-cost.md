---
title: "ストレージコスト | Cloud"
slug: /storage-cost
sidebar_label: "ストレージ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、cluster が稼働しているかどうかにかかわらず、データまたはバックアップファイルを保存するとストレージコストが発生します。 | Cloud"
type: origin
token: PNj2w5fY9ifr82kbX8ucKgXAn0r
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ストレージコスト

Zilliz Cloud では、cluster が稼働しているかどうかにかかわらず、データまたはバックアップファイルを保存するとストレージコストが発生します。

## ストレージコストの発生源\{#sources-of-storage-costs}

以下のシナリオでストレージ料金が請求されます。

- Dedicated cluster: Dedicated cluster に保存されたデータ。

- Serverless cluster: Serverless cluster に保存されたデータ。

- [Database](./database): オンデマンド検索に使用する databases に保存されたデータ。

    - 管理対象 collection 内のデータおよび index。

    - 外部 collection 内の index。

- [Backup](./create-backup) storage: 障害復旧のために作成したバックアップファイル。

- [Managed volume](./managed-volume) storage: volume に保存された構造化データ、または非構造化データファイルの collection。

## コスト計算\{#cost-calculation}

```plaintext
Storage Cost = Storage Unit Price x Data Size x Duration
```

- Storage Unit Price: クラウドリージョンと cluster タイプによって決まります。詳細な料金については、[Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- Data Size: 保存されるすべてのデータのサイズ、またはバックアップファイルのサイズで、GB 単位で測定されます。

- Duration: データまたはバックアップファイルが Zilliz Cloud に保存される期間。

## 課金ルール\{#billing-rules}

cluster、volume storage の課金ルールは、backup storage や cold data access とは少し異なります。

- **Dedicated & Serverless Cluster, Volume, and Database Storage:** 時間単位で課金され、最小課金時間は 1 時間です。

- **Backup Storage:** 日単位で課金され、最小課金日は 1 日です。

## 例\{#examples}

以下は、ストレージコストの計算方法を理解するための例です。

### 例 1: Dedicated cluster のストレージコスト\{#example-1-dedicated-cluster-storage-cost}

サービング cluster の構成が以下のとおりであるとします。

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Data Size**: 500 GB

- **Storage Duration**: 29 日 23 時間 30 分

クラウドプロバイダーとリージョン、および cluster タイプの情報から、[Pricing Page](https://zilliz.com/pricing) でストレージの単価が **&#36;0.025/GB per month** であることがわかります。

[課金ルール](./storage-cost#billing-rules)により、1 時間未満の端数は 1 時間に切り上げられます。保存期間の 29 日 23 時間 30 分は 30 日に切り上げられ、これは 1 か月に相当します。

データストレージの総コストは `$0.025 x 500 × 1 = $12.50` です。

### 例 2: Backup storage のコスト\{#example-2-backup-storage-cost}

cluster の構成が以下のとおりであるとします。

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Backup File Size**: 20 GB

- **Backup File Retention Period**: 44 日 6 時間

クラウドプロバイダーとリージョン、および cluster タイプの情報から、[Pricing Page](https://zilliz.com/pricing) でストレージの単価が **&#36;0.025/GB per month** であることがわかります。

[課金ルール](./storage-cost#billing-rules)により、1 日未満の端数は 1 日に切り上げられます。したがって、保持期間の 44 日 6 時間は 45 日に切り上げられ、これは 1.5 か月に相当します。

この例の cluster の backup storage 総コストは `$0.025 x 20 x 1.5 = $0.75` です。

### 例 3: Managed volume storage のコスト\{#example-3-managed-volume-storage-cost}

インポートのために volume に **10 GB** のデータをアップロードし、それを **1 か月** 保持した場合、単価が **&#36;0.04/GB per month** であれば、コストは `$0.04 × 10 × 1 = $0.40` です。

## FAQs\{#faqs}

1. **cluster を一時停止してもストレージ料金は請求されますか？**

    はい。cluster が一時停止されていても、cluster データ、backup、または volume ファイルが保持されている限り、ストレージコストが適用されます。

1. **ストレージには最低料金がありますか？**
 はい。ストレージには最低料金があります。

    - cluster および volume storage: 最小 1 時間分の課金。

    - backup storage: 最小 1 日分の課金。

