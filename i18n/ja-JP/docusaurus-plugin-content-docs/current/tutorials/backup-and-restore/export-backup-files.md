---
title: "バックアップファイルをエクスポート | Cloud"
slug: /export-backup-files
sidebar_label: "バックアップファイルをエクスポート"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。 | Cloud"
type: origin
token: QUTDwkbTTiA2UlkWYDlc796ensf
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - backup
  - export
  - integrate
  - object
  - storage
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';


# バックアップファイルをエクスポート

Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクトの<strong>専用</strong>クラスター向けに<strong>プライベートプレビュー</strong>中です。この機能を有効にする、または関連する料金について知るには、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポート</a>までお問い合わせください。</p>

</Admonition>

## 事前準備\{#before-you-start}

- Zilliz Cloudをオブジェクトストレージと統合済みです。詳細な手順については、[AWS S3と統合](./integrate-with-aws-s3)、[Azure Blob Storageと統合](./integrate-with-azure-blob-storage)、または[Google Cloud Storageと統合](./integrate-with-gcp)を参照してください。

- プロジェクトへの<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>としてのアクセス権を持っています。必要な権限がない場合は、Zilliz Cloud管理者にお問い合わせください。

## 手順\{#procedure}

Zilliz Cloudからバックアップファイルをエクスポートするには、Zilliz Cloudコンソール経由、またはRESTful API経由のいずれかを選択できます。

### Zilliz Cloudコンソール経由でエクスポート\{#export-via-zilliz-cloud-console}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションペインで、**バックアップ**を選択します。

1. 表示されたページで、対象のバックアップファイルを見つけ、**アクション**列の**...**をクリックし、**エクスポート**を選択します。

    <Admonition type="info" icon="📘" title="注意">

    <p><strong>利用可能</strong>ステータスのバックアップファイルのみがエクスポート可能です。</p>

    </Admonition>

1. **バックアップファイルをエクスポート**ダイアログボックスで、バックアップ設定を構成します：

    - **バックアップファイル内のクラスターのクラウドリージョン**: バックアップファイルが作成されたクラウドリージョンを表示します。

    - **統合**: Zilliz Cloudと統合されているオブジェクトストレージプロバイダーを選択します。

    - **統合構成**: バックアップエクスポート用に構成した特定のバケットを選択します。

    - **ディレクトリ**: エクスポートされたバックアップファイルが保存されるオブジェクトストレージバケット内のディレクトリパスを入力します。

1. 次に、**エクスポート**をクリックします。

![export-backup-file](/img/export-backup-file.png)

### RESTful API経由でエクスポート\{#export-through-restful-api}

[Zilliz Cloud RESTful APIエンドポイント](/reference/restful/export-backup-files-v2)経由でZilliz Cloudからバックアップファイルをエクスポートするには、AWS S3バケットのいずれかをZilliz Cloudと統合し、その統合IDを取得する必要があります。詳細は、[統合IDを取得](./integrate-with-aws-s3#obtain-the-integration-id)を参照してください。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
export BACKUP_ID="backup-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/export" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "integrationId": "inter-xxxxxxx",
    "directory": "destdir/"
}'
```

上記リクエストに対する応答は、以下のようなジョブIDになります：

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## エクスポートの進行状況を監視\{#monitor-export-progress}

**エクスポート**をクリックすると、エクスポートジョブが自動的に生成されます：

1. 左側のナビゲーションペインで、[ジョブ](https://docs.cloud-uat3.zilliz.com/docs/job-center)ページに移動します。

1. ジョブの**ステータス**を監視します：

    - **進行中**: ファイルがエクスポートされています。

    - **成功**: バックアップファイルが正常にエクスポートされました。指定されたS3バケットでアクセスできます。

    - **エラー**: ジョブが失敗しました。これは、Role ARNやバックアップファイルなど、エクスポート処理で使用されるリソースがジョブ実行中に削除された場合に発生する可能性があります。

![monitor-export-job](/img/monitor-export-job.png)

## エクスポートジョブをキャンセル\{#cancel-export-job}

ジョブが**進行中**のステータスで、続行しないことに決めた場合は、**アクション**列の**キャンセル**をクリックしてジョブをキャンセルできます。

<Admonition type="info" icon="📘" title="注意">

<p>途中でキャンセルしても、バケットに既にアップロードされたデータは削除されません。</p>

</Admonition>
