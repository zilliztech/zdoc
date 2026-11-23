---
title: "Slow Logs の設定 | Cloud"
slug: /configure-slow-logs
sidebar_label: "Slow Logs の設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スローログを使用して、想定より時間がかかる Search、HybridSearch、Query リクエストを調査します。実行時間のしきい値を設定し、該当するリクエストをオブジェクトストレージまたは HTTPS サービスに転送して分析できます。 | Cloud"
type: origin
token: QoEpwKGbEirQl1kh3W3c0zdinAd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Slow Logs の設定

スローログを使用して、想定より時間がかかる Search、HybridSearch、Query リクエストを調査します。実行時間のしきい値を設定し、該当するリクエストをオブジェクトストレージまたは HTTPS サービスに転送して分析できます。

## 開始する前に\{#before-you-start}

- Enterprise プラン以上の稼働中の Dedicated クラスターを使用していること。

- クラスターへのアクセス権を持つ **Organization Owner**、**Project Admin**、または **クラスター Admin** としてサインインしていること。

- **クラスターと同じプロジェクト**で、転送先の統合を準備すること：

    - **バケットまたはコンテナーにログを保存する場合：** [Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) の統合を、クラスターのリージョンに設定すること。

    - **ログをログ管理システムに送信する場合：** HTTPS 経由でログを受信するサービスを準備し、その URL と認証設定を使用して [HTTPS Endpoint 統合](./integrate-with-https-endpoint) を構成すること。

スローログは、監査ログおよびアクセスログとは独立して構成します。スローログを構成するために、監査ログまたはアクセスログを無効にする必要はありません。統合を作成すると転送先が準備されます。以下の手順では、クラスターからの転送を有効にします。

## スローログ転送を有効にする\{#enable-slow-log-forwarding}

<Supademo id="cmwa5r4vs07nwqmfqs04zwdz3" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開きます。**Slow Logs** カードで **Configure** をクリックします。

1. **Slow Logs Settings** で、ログの送信先を選択します：

    - **Send To:** このプロジェクトで準備した統合を選択します。

    - **Format:** 受信システムが処理できる形式を選択します：**JSON**、**ECS**、または **OTel**（OpenTelemetry）。

    - **For object storage:** 転送先ディレクトリを指定し、パスのプレビューを確認します。HTTPS の転送先ではディレクトリを使用しません。

1. **Slow Log Threshold (ms)** を、リクエストを調査する実行時間のしきい値に設定します。デフォルトは **150 ms** です。たとえば、しきい値が 150 ms の場合、200 ms かかるリクエストはスローログの対象になります。しきい値を低くするとより多くのリクエストが記録され、高くすると実行時間の長いリクエストに絞り込まれます。

1. 転送先としきい値を確認し、**Start Forwarding** をクリックします。**Slow Logs** カードでステータスを確認し、一致するログが転送先に到達していることを確認します。

</Procedures>

## ログの到着を確認する\{#verify-that-logs-arrive}

<Procedures>

1. 転送が有効になったら、実行時間が構成したしきい値を超える **Search**、**HybridSearch**、または **Query** リクエストを特定します。操作時刻と対象のコレクションを控えておいてください。しきい値を下回るリクエストでは、スローログは生成されません。

1. 転送先で対応するレコードを探します：

    - **Object storage:** 構成したバケットまたはコンテナーとディレクトリを開き、新しく配信されたログオブジェクトを確認します。

    - **HTTPS endpoint:** 受信サービスの取り込み記録または保存されたログを確認します。

1. 記録された操作と実行時間を、調査しているリクエストと比較します。フィールドの定義については、[Slow Logs Reference](./slow-log-reference) を参照してください。

</Procedures>

統合テストが成功しても、実際のスローログが配信されたことは確認できません。しきい値を超えるリクエストがない場合、スローログが存在しないことだけでは転送の失敗を示すものではありません。

## よくある質問\{#faq}

- **Configure を使用できないのはなぜですか？**

    クラスターが稼働していること、およびロール、プラン、クラスタータイプがスローログをサポートしていることを確認してください。スローログは、監査ログおよびアクセスログとは別に構成します。

- **転送先の統合が見つからないのはなぜですか？**

    統合は、クラスターと同じプロジェクトに属している必要があります。プロジェクトの **Integrations** ページを確認し、必要に応じてそこで統合を作成してください。

- **スローログが到着しないのはなぜですか？**

    コンソールで転送ステータスとエラーを確認してから、リクエストと転送先を確認してください：

    - リクエストが転送の開始後に発生し、サポート対象の操作であり、構成したしきい値を超えていることを確認してください。

    - オブジェクトストレージの場合は、書き込み権限を確認し、構成したディレクトリを調べます。

    - HTTPS の場合は、レシーバーの可用性、認証設定、取り込みエラーを確認してください。

