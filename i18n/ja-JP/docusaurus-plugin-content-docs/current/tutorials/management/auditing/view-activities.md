---
title: "プラットフォーム監査ログ | Cloud"
slug: /view-activities
sidebar_label: "プラットフォーム監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プラットフォーム監査ログには、クラスターの作成、再開、削除、組織ユーザーの管理、統合の構成など、Zilliz Cloud のリソースと組織設定に対する管理操作が記録されます。各ログには、操作、発生時刻、およびその操作を実行したユーザーまたはシステムが記録されます。これらのレコードを使用して、変更を調査し、管理アクティビティを確認してください。 | Cloud"
type: origin
token: PynkwpI6Qi7zL9kiTBfchREknOc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォーム監査ログ

プラットフォーム監査ログには、クラスターの作成、再開、削除、組織ユーザーの管理、統合の構成など、Zilliz Cloud のリソースと組織設定に対する管理操作が記録されます。各ログには、操作、発生時刻、およびその操作を実行したユーザーまたはシステムが記録されます。これらのレコードを使用して、変更を調査し、管理アクティビティを確認してください。

このガイドでは、次の方法について説明します。

- 操作を検索し、実行者を特定するために、[ログを表示](./view-activities#view-platform-audit-logs) します。

- 監査用にレコードを共有したり、コンソール外で分析したりするために、[ログをダウンロード](./view-activities#download-platform-audit-logs) します。

- 継続的なアーカイブと分析のために、[ログを転送](./view-activities#forward-platform-audit-logs) して、独自のストレージまたは受信サービスに保存します。

## Platform Audit Logs を表示する\{#view-platform-audit-logs}

![C2GJw1dXnhIQ5RbnINocJfAhnhh](https://zdoc-images.s3.us-west-2.amazonaws.com/C2GJw1dXnhIQ5RbnINocJfAhnhh.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、組織を選択して、組織のナビゲーションで **Platform Audit Logs** をクリックします。

1. 一覧を絞り込むには、次のフィルターを使用します。デフォルトのフィルターに戻すには、**Reset** をクリックします。

    | フィルター | 使用方法 |
    | --- | --- |
    | All Levels | **Info**、**Warning**、**Error** のいずれかを選択するか、すべてのレベルを保持します。 |
    | All Services | **クラスター**、**User**、**Integration** など、カテゴリを選択します。 |
    | Date range | 開始日と終了日を選択し、**Apply** をクリックします。各クエリは最大 90 × 24 時間を対象にできます。 |

1. 一致するレコードを確認します。各レコードには次のフィールドが含まれます。

    | フィールド | 説明 |
    | --- | --- |
    | Level | **Info**: 情報イベントです。**Warning**: クラスターの削除など、注意が必要なイベントです。**Error**: 報告された失敗です。 |
    | Service | イベントに関連するサービスまたはリソースのカテゴリです。 |
    | Message | 操作と影響を受けたリソースです。 |
    | Occurred At | イベントの発生日時です。 |
    | Actor | 操作を実行したユーザーまたはシステムです。 |

</Procedures>

## プラットフォーム監査ログをダウンロードする\{#download-platform-audit-logs}

ログをオフラインで確認したり、他のユーザーと共有したりするには、レコードを CSV または JSON Lines としてダウンロードします。

<Procedures>

1. 組織の **Platform Audit Logs** ページで、必要なレコードのフィルターを選択します。

1. **Download** をクリックし、スプレッドシートで確認する場合は **CSV (.csv)**、プログラムで処理する場合は **JSON (.jsonl)** を選択します。JSON レコードは 1 行に 1 件です。

</Procedures>

ダウンロードには、ページをまたいだ一致するすべてのレコードが含まれます（最大 **100,000 レコード**）。結果がこの上限を超える場合は、フィルターを絞り込んでください。

## プラットフォーム監査ログを転送する\{#forward-platform-audit-logs}

管理アクティビティの継続的なコピーを独自のストレージまたはログ処理システムに保持する必要がある場合は、自動転送を有効にします。Zilliz Cloud は、組織全体のログを 1 つの転送先に送信します。転送先を 1 回構成すると、新しいログは利用可能になり次第転送されます。

### 事前準備\{#before-you-start}

- **Organization Owner** であり、転送先の統合を使用する権限を持っていること。統合には、Zilliz Cloud がログを転送先に送信するために必要な接続とアクセス設定が保存されます。

- 同じ組織内のプロジェクトで、次のいずれかの統合を準備しておくこと。まだ作成していない場合は、プロジェクトの **Integrations** ページを開き、転送先のガイドに従ってください。

    - **オブジェクトストレージ:** ログファイルをアーカイブまたは後で処理するために保持するバケットまたはコンテナを使用します。ログを書き込むために必要なアクセス権を持つ [Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) 統合を作成します。

    - **HTTPS エンドポイント:** ログを処理システムに取り込むための受信サービスを使用します。サービスの HTTPS URL と認証情報を準備し、[Integrate with an HTTPS Endpoint](./integrate-with-https-endpoint) に従ってください。統合を作成すると Zilliz Cloud が既存の受信側に接続されますが、そのサービスは作成されず、転送も開始されません。

### 転送を構成する\{#configure-forwarding}

次のデモでは、Amazon S3 統合を使用した構成を示します。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で、組織の **Platform Audit Logs** ページに移動し、**Auto-forward** カードの **Turn On** をクリックします。

1. **Send To** で、プロジェクトの下に準備した統合を選択します。転送では組織全体のプラットフォーム監査ログが対象となり、プロジェクトの選択やログ一覧のフィルターによってこの範囲は制限されません。

1. オブジェクトストレージの場合は、必要に応じて **Forward Directory** を入力します。入力例は **platform-audit/**. パスはバケットまたはコンテナからの相対パスであり、**/** で終わる必要があります。先頭に使用できないのは **/**. 追加のディレクトリが不要な場合は空のままにします。このフィールドは HTTPS エンドポイントには適用されません。

1. 受信システムまたは処理ツールが想定する **Format** を選択します:

    - **JSON**: アーカイブまたはカスタム処理用です。

    - **ECS**: Elastic Common スキーマ フィールドを想定するパイプライン用です。

    - **OTel**: OpenTelemetry ログ形式を想定するパイプライン用です。

1. 正常に配信されていない保持済みの履歴ログを含めるには、**Also send all undelivered past logs** を選択します。新規ログのみを転送する場合は選択しないままにします。ログ一覧の日付フィルターは、含まれる履歴を制限しません。

1. 設定を確認し、**Start Forwarding** をクリックします。**Auto-forward** カードに転送先と配信の進行状況が表示されます。

</Procedures>

### ログが到着することを確認する\{#confirm-that-logs-arrive}

<Procedures>

1. **Auto-forward** カードで配信の進行状況を確認します: **Last delivered**、**Sent today**、**Waiting to send**。

1. コンソールで最近のイベントを確認し、転送先で同じメッセージと発生時刻を探します。履歴ログを除外した場合は、転送の開始後に発生したイベントを選択します。

    - **オブジェクトストレージ:** 構成したバケットまたはコンテナとディレクトリを開き、配信されたファイルを確認します。

    - **HTTPS エンドポイント:** 受信システムによって保存またはインデックス化されたレコードを確認します。

1. 処理ツールが選択した形式でレコードを読み取れることを確認します。

</Procedures>

### 転送を停止する\{#stop-forwarding}

組織のログを構成済みの転送先に送信する必要がなくなったら、転送を停止します。

<Procedures>

1. **Auto-forward** カードで転送先と **Waiting to send** の件数を確認します。停止する前に転送先でレコードが必要な場合は、先に受信を確認してください。

1. 停止する準備ができたら **Turn Off** をクリックします。このボタンは停止リクエストをすぐに送信します。確認ダイアログは表示されません。

1. **Auto-forward** のステータスが **Off** に変わるまで待ちます。リクエストの処理中、ページには **Stopping forwarding** と表示されます。

</Procedures>

コンソールでは、利用可能なプラットフォーム監査ログの表示とダウンロードを引き続き行えます。

## FAQ\{#faq}

- **転送先で転送されたログが見つからないのはなぜですか？**

    次の点を確認してください:

    - **イベントと転送先:** 構成した転送先を確認していることを確かめます。履歴ログを含めなかった場合は、転送の開始後に発生したイベントを探します。

    - **配信ステータス:** **Auto-forward** カードでエラーまたは送信待ちのログを確認します。報告されたエラーがある場合は、その内容に基づいて確認を行います。

    - **転送先へのアクセス:** オブジェクトストレージの場合は、構成したディレクトリと統合の書き込み権限を確認します。HTTPS の場合は、受信側の可用性、認証、証明書、および選択した形式の処理を確認します。

- **接続テストに成功すれば、ログが配信されていることになりますか？**

    いいえ。転送を有効にした後、実際のプラットフォーム監査ログが転送先にあることを確認してください。接続テストの成功だけでは、受信システムがそのログを保存または処理したことを確認できません。
