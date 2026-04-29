---
title: "バックアップファイルのエクスポート | Cloud"
slug: /export-backup-files
sidebar_key: export-backup-files
sidebar_label: "バックアップファイルのエクスポート"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloud コンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。| Cloud"
type: origin
token: QUTDwkbTTiA2UlkWYDlc796ensf
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - エクスポート
  - 統合
  - オブジェクト
  - ストレージ

---

import Admonition from '@theme/Admonition';


# バックアップファイルのエクスポート

Zilliz Cloud コンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスター向けに <strong>プライベートプレビュー</strong> として提供されています。この機能を有効化する方法や関連コストについて詳しく知るには、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud サポート</a>までお問い合わせください。</p>

</Admonition>

## 開始前の準備\{#before-you-start}

- Zilliz Cloud をオブジェクトストレージと統合済みであること。詳細な手順については、[AWS S3 との統合](./integrate-with-aws-s3)、[Azure Blob Storage との統合](./integrate-with-azure-blob-storage)、または [Google Cloud Storage との統合](./integrate-with-gcp) を参照してください。

- プロジェクトに対して **組織オーナー** または **プロジェクト管理者** のアクセス権を持っていること。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

## 手順\{#procedure}

Zilliz Cloud からバックアップファイルをエクスポートするには、Zilliz Cloud コンソールまたは RESTful API のいずれかを使用できます。

### Zilliz Cloud コンソールからエクスポートする\{#export-via-zilliz-cloud-console}

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 左側のナビゲーションペインで **Backups** を選択します。

1. 表示されたページで、対象のバックアップファイルを見つけ、**Actions** 列の **...** をクリックし、**Export** を選択します。

    <Admonition type="info" icon="📘" title="Notes">

    <p><strong>Available</strong> ステータスのバックアップファイルのみエクスポート可能です。</p>

    </Admonition>

1. **Export Backup File** ダイアログボックスで、バックアップ設定を構成します：

    - **クラウドリージョン of Cluster in Backup File**: バックアップファイルが作成されたクラウドリージョンが表示されます。

    - **Integration**: Zilliz Cloud と統合済みのオブジェクトストレージプロバイダーを選択します。

    - **統合設定**: バックアップエクスポート用に設定したバケットを指定します。

    - **Directory**: エクスポートされたバックアップファイルを保存するオブジェクトストレージバケット内のディレクトリパスを入力します。

1. **Export** をクリックします。

![export-backup-file](https://zdoc-images.s3.us-west-2.amazonaws.com/export-backup-file.png "export-backup-file")

### RESTful API からエクスポートする\{#export-through-restful-api}

[Export Backup Files](/reference/restful/export-backup-files-v2) RESTful API エンドポイントを使用して Zilliz Cloud からバックアップファイルをエクスポートする前に、AWS S3 バケットのいずれかを Zilliz Cloud と統合し、その統合IDを取得しておく必要があります。詳細については、[統合IDの取得](./integrate-with-aws-s3#obtain-the-integration-id) を参照してください。

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

上記リクエストに対するレスポンスは、以下のようなジョブIDになります。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## エクスポートの進行状況を監視する\{#monitor-export-progress}

**Export** をクリックすると、自動的にエクスポートジョブが生成されます。

1. 左側のナビゲーションペインから [ジョブ](https://docs.cloud-uat3.zilliz.com/docs/job-center) ページに移動します。

1. ジョブの **Status** を確認します。

    - **IN PROGRESS**: ファイルがエクスポート中です。

    - **SUCCESSFUL**: バックアップファイルが正常にエクスポートされました。指定した S3 バケットからアクセスできます。

    - **ERROR**: ジョブが失敗しました。これは、エクスポート処理で使用されるリソース（ロール ARN やバックアップファイルなど）がジョブ実行中に削除された場合に発生することがあります。

![monitor-export-job](https://zdoc-images.s3.us-west-2.amazonaws.com/monitor-export-job.png "monitor-export-job")

## エクスポートジョブをキャンセルする\{#cancel-export-job}

ジョブが **IN PROGRESS** の状態のまま継続しており、処理を中止したい場合は、**Actions** 列の **Cancel** をクリックしてジョブをキャンセルできます。

<Admonition type="info" icon="📘" title="Notes">

<p>途中でキャンセルしても、すでにバケットにアップロードされたデータは削除されません。</p>

</Admonition>

