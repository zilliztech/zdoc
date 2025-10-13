---
title: "バックアップファイルのエクスポート | Cloud"
slug: /export-backup-files
sidebar_label: "バックアップファイルのエクスポート"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。 | Cloud"
type: origin
token: LEL8wsFaxidFcKkep84c6plnnub
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
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';


# バックアップファイルのエクスポート

Zilliz Cloudコンソールを使用して、バックアップファイルをオブジェクトストレージにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>プライベートプレビュー</strong>として<strong>Dedicated-Enterprise</strong>プランのクラスターで提供されています。この機能を有効にするか、関連するコストについては、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 始める前に{#before-you-start}

- Zilliz Cloudをオブジェクトストレージに統合しました。詳細な手順については、[AWS S 3との統合](./integrate-with-aws-s3)するを参照してください。

- プロジェクトには**組織オーナー**また**はプロジェクト管理者**のアクセス権があります。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## 手続き{#procedure}

Zilliz Cloudからバックアップファイルをエクスポートするには、Zilliz CloudコンソールまたはRESTful APIを使用します。 

### Zilliz Cloudコンソールを使用してエクスポートする{#export-via-zilliz-cloud-console}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションウィンドウで、&#91;**バックアップ**&#93;を選択します。

1. 表示されるページで、対象のバックアップファイルを探し、をクリックします**。。。**&#91;**アクション**&#93;列で、&#91;**エクスポート**&#93;を選択します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>エクスポートできるのは、&#91;<strong>利用可能</strong>&#93;ステータスのバックアップファイルのみです。</p>

    </Admonition>

1. &#91;**バックアップファイルのエクスポート**&#93;ダイアログボックスで、バックアップ設定を構成します。

    - **Cloud Region of Cluster in Backup File**:バックアップファイルが作成されたクラウドリージョンを表示します。

    - **連携**: Zilliz Cloudと連携するオブジェクトストレージプロバイダを選択してください。現在、AWS S 3がサポートされています。詳細については、「[AWS S 3との統合](./integrate-with-aws-s3)する」を参照してください。

    - **統合構成**:バックアップエクスポート用に構成した特定のバケットを選択します。

    - **ディレクトリ**:エクスポートしたバックアップファイルを保存するオブジェクトストレージバケットのディレクトリパスを入力します。

1. &#91;**エクスポート**&#93;をクリックします。

    ![export-backup-file](/img/export-backup-file.png)

### RESTful APIを使用してエクスポートする{#export-through-restful-api}

[Export Backup Files RESTful API](/ja-JP/reference/restful/export-backup-files-v2)エンドポイントを使用してZilliz Cloudからバックアップファイルをエクスポートする前に、AWS S 3バケットの1つをZilliz Cloudに統合し、その統合IDを取得する必要があります。詳細については、[統合IDの取得](./integrate-with-aws-s3#obtain-the-integration-id)を参照してください。

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

&#91;**エクスポート**&#93;をクリックすると、エクスポートジョブが自動的に生成されます。

1. 左側のナビゲーションウィンドウの[[ジョブ](./job-center)&#93;ページに移動します。

1. ジョブの**ステータス**を監視する:

    - **進行中**:ファイルがエクスポートされています。

    - **成功**:バックアップファイルが正常にエクスポートされました。指定されたS 3バケットでアクセス可能です。

    - **エラー**:ジョブが失敗しました。これは、ロールARNやバックアップファイルなど、エクスポート過程で使用されるリソースがジョブの実行中に削除された場合に発生します。

![monitor-export-job](/img/monitor-export-job.png)

## エクスポートジョブをキャンセル{#cancel-export-job}

ジョブが**IN PROGRESS**ステータスのままで続行しない場合は、&#91;アクション&#93;列の&#91;**キャンセル**&#93;をクリックしてジョブを**キャンセル**できます。

<Admonition type="info" icon="📘" title="ノート">

<p>途中でキャンセルしても、バケットにすでにアップロードされているデータは削除されません。</p>

</Admonition>

