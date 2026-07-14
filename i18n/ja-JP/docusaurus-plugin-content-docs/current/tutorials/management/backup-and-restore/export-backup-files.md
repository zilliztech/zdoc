---
title: "バックアップファイルのエクスポート | Cloud"
slug: /export-backup-files
sidebar_label: "バックアップファイルのエクスポート"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud コンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。 | Cloud"
type: origin
token: QUTDwkbTTiA2UlkWYDlc796ensf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# バックアップファイルのエクスポート

Zilliz Cloud コンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。

<Admonition type="info" icon="📘" title="注意">

この機能は、**Enterprise** プロジェクト内の **Dedicated** cluster を対象に **Private Preview** として提供されています。この機能を有効にする方法、または関連する費用については、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us)にお問い合わせください。

</Admonition>

## 始める前に\{#before-you-start}

- Zilliz Cloud をオブジェクトストレージと統合済みであること。詳細な手順については、[AWS S3 との統合](./integrate-with-aws-s3)、[Azure Blob Storage との統合](./integrate-with-azure-blob-storage)、または [Google Cloud Storage との統合](./integrate-with-gcp)を参照してください。

- プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権限を持っていること。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

## 手順\{#procedure}

Zilliz Cloud からのバックアップファイルのエクスポートは、Zilliz Cloud コンソールまたは RESTful API のいずれかを使用して行えます。 

### Zilliz Cloud コンソールでエクスポートする\{#export-via-zilliz-cloud-console}

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションペインで **Backups** を選択します。

1. 表示されたページで対象のバックアップファイルを見つけ、**Actions** 列の **...** をクリックしてから **Export** を選択します。

    <Admonition type="info" icon="📘" title="注意">

    エクスポートできるのは、ステータスが **Available** のバックアップファイルのみです。

    </Admonition>

1. **Export Backup File** ダイアログボックスで、バックアップ設定を構成します。

    - **Cloud Region of Cluster in Backup File**: バックアップファイルが作成された cloud region を表示します。

    - **Integration**: Zilliz Cloud と統合されているオブジェクトストレージプロバイダーを選択します。

    - **Integration Configuration**: バックアップのエクスポート用に設定した特定のバケットを選択します。

    - **Directory**: エクスポートしたバックアップファイルを保存する、オブジェクトストレージバケット内のディレクトリパスを入力します。

1. 次に、**Export** をクリックします。

![export-backup-file](https://zdoc-images.s3.us-west-2.amazonaws.com/export-backup-file.png "export-backup-file")

### RESTful API によるエクスポート\{#export-through-restful-api}

[Export Backup Files](/reference/restful/export-backup-files-v2) RESTful API エンドポイントを介して Zilliz Cloud からバックアップファイルをエクスポートする前に、AWS S3 バケットのいずれかを Zilliz Cloud と統合し、その integration ID を取得する必要があります。詳細については、[integration ID を取得する](./integrate-with-aws-s3#obtain-the-integration-id)を参照してください。

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

上記のリクエストに対するレスポンスは、次のような Job ID になります。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## エクスポートの進行状況を監視する\{#monitor-export-progress}

**Export** をクリックすると、エクスポートジョブが自動的に生成されます。

1. 左側のナビゲーションペインで [Jobs](./job-center) ページに移動します。

1. ジョブの **Status** を監視します。

    - **IN PROGRESS**: ファイルはエクスポート中です。

    - **SUCCESSFUL**: バックアップファイルのエクスポートが正常に完了しました。指定した S3 バケットでアクセスできます。

    - **ERROR**: ジョブは失敗しました。これは、Role ARN やバックアップファイルなど、エクスポート処理で使用されるリソースがジョブ実行中に削除された場合に発生することがあります。

![monitor-export-job](https://zdoc-images.s3.us-west-2.amazonaws.com/monitor-export-job.png "monitor-export-job")

## エクスポートジョブをキャンセルする\{#cancel-export-job}

ジョブが **IN PROGRESS** ステータスのままで、続行しないことにした場合は、**Actions** 列の **Cancel** をクリックしてジョブをキャンセルできます。

<Admonition type="info" icon="📘" title="注意">

途中でキャンセルしても、すでにバケットにアップロードされたデータは削除されません。

</Admonition>

