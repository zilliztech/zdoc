---
title: "バックアップファイルのエクスポート | Cloud"
slug: /export-backup-files
sidebar_label: "バックアップファイルのエクスポート"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。 | Cloud"
type: origin
token: QUTDwkbTTiA2UlkWYDlc796ensf
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - export
  - integrate
  - object
  - storage
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db

---

import Admonition from '@theme/Admonition';


# バックアップファイルのエクスポート

Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>Dedicated-Enterprise</strong>プランのクラスターの<strong>プライベートプレビュー</strong>にあります。この機能を有効にするか、関連するコストについては、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 始める前に{#before-you-start}

- Zilliz Cloudをオブジェクトストレージに統合しました。詳細な手順については、[AWS S 3との統合](./integrate-with-aws-s3)と[トップ>Azure Blob Storage](./integrate-with-azure-blob-storage)を参照してください。

- プロジェクトには**Organization Owner**または**Project Admin**のアクセス権があります。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## 手続き{#procedure}

Zilliz Cloudからバックアップファイルをエクスポートするには、Zilliz CloudコンソールまたはRESTful APIを使用します。 

### Zilliz Cloudコンソールを使用してエクスポートする{#export-via-zilliz-cloud-console}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. 左側のナビゲーションペインで、**バックアップ**を選択してください。

1. 表示されるページで、ターゲットのバックアップファイルを見つけ、**をクリックします。。。「アクション」列で、「エクスポート」を選択してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p><strong>利用可能</strong>ステータスのバックアップファイルのみがエクスポートできます。</p>

    </Admonition>

1. **バックアップファイルのエクスポート**ダイアログボックスで、バックアップ設定を構成してください:

    - **バックアップファイルのクラスタのクラウドリージョン**:バックアップファイルが作成されたクラウドリージョンを表示します。

    - **統合**: Zilliz Cloudと統合されたオブジェクトストレージプロバイダを選択してください。現在、AWS S 3がサポートされています。詳細については、[AWS S 3との統合](./integrate-with-aws-s3)を参照してください。

    - **統合構成**:バックアップエクスポートに設定した特定のバケットを選択してください。

    - **ディレクトリ**:エクスポートされたバックアップファイルが保存されるオブジェクトストレージバケットのディレクトリパスを入力してください。

1. その後、**エクスポート**をクリックしてください。

![export-backup-file](/img/export-backup-file.png)

### RESTful APIを使用してエクスポートする{#export-through-restful-api}

Zilliz Cloudから[バックアップファイルのエクスポート](/reference/restful/export-backup-files-v2) RESTful APIエンドポイントを介してバックアップファイルをエクスポートする前に、AWS S 3バケットの1つをZilliz Cloudに統合し、その統合IDを取得する必要があります。詳細については、[インテグレーションIDを取得する](./integrate-with-aws-s3#obtain-the-integration-id)を参照してください。

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

上記の要求に対する応答は、次のようなジョブIDになります。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## エクスポートの進捗を監視する{#monitor-export-progress}

「エクスポート」をクリックすると、エクスポートジョブが自動的に生成されます

1. 左側のナビゲーションウィンドウの[仕事](https://docs.cloud-uat3.zilliz.com/docs/job-center)ページに移動します。

1. 仕事の**ステータス**を監視する:

    - **進行中**:ファイルがエクスポートされています。

    - **成功**:バックアップファイルが正常にエクスポートされました。指定されたS 3バケットでアクセス可能です。

    - **エラー**:ジョブが失敗しました。これは、ロールARNやバックアップファイルなど、エクスポート過程で使用されたリソースがジョブの実行中に削除された場合に発生する可能性があります。

![monitor-export-job](/img/monitor-export-job.png)

## エクスポートジョブをキャンセル{#cancel-export-job}

仕事が**進行中**の状態のままで、続行しないことを決めた場合は、**アクション**列の**キャンセル**をクリックして仕事をキャンセルできます。

<Admonition type="info" icon="📘" title="ノート">

<p>途中でキャンセルしても、バケットにすでにアップロードされているデータは削除されません。</p>

</Admonition>

