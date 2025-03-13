---
title: "バックアップファイルのエクスポート | Cloud"
slug: /export-backup-files
sidebar_label: "バックアップファイルのエクスポート"
beta: PRIVATE
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
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

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

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションウィンドウで、[**バックアップ**]を選択します。

1. 表示されるページで、対象のバックアップファイルを探し、をクリックします**。。。**[**アクション**]列で、[**エクスポート**]を選択します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>エクスポートできるのは、[<strong>利用可能</strong>]ステータスのバックアップファイルのみです。</p>

    </Admonition>

1. [**バックアップファイルのエクスポート**]ダイアログボックスで、バックアップ設定を構成します。

    - **Cloud Region of Cluster in Backup File**:バックアップファイルが作成されたクラウドリージョンを表示します。

    - **連携**: Zilliz Cloudと連携するオブジェクトストレージプロバイダを選択してください。現在、AWS S 3がサポートされています。詳細については、「[AWS S 3との統合](./integrate-with-aws-s3)する」を参照してください。

    - **統合構成**:バックアップエクスポート用に構成した特定のバケットを選択します。

    - **ディレクトリ**:エクスポートしたバックアップファイルを保存するオブジェクトストレージバケットのディレクトリパスを入力します。

1. [**エクスポート**]をクリックします。

![export-backup-file](/img/ja-JP/export-backup-file.png)

## エクスポートの進捗を監視する{#monitor-export-progress}

[**エクスポート**]をクリックすると、エクスポートジョブが自動的に生成されます。

1. 左側のナビゲーションウィンドウの[[ジョブ](./job-center)]ページに移動します。

1. ジョブの**ステータス**を監視する:

    - **進行中**:ファイルがエクスポートされています。

    - **成功**:バックアップファイルが正常にエクスポートされました。指定されたS 3バケットでアクセス可能です。

    - **エラー**:ジョブが失敗しました。これは、ロールARNやバックアップファイルなど、エクスポート過程で使用されるリソースがジョブの実行中に削除された場合に発生します。

![monitor-export-job](/img/ja-JP/monitor-export-job.png)

## エクスポートジョブをキャンセル{#cancel-export-job}

ジョブが**IN PROGRESS**ステータスのままで続行しない場合は、[アクション]列の[**キャンセル**]をクリックしてジョブを**キャンセル**できます。

<Admonition type="info" icon="📘" title="ノート">

<p>途中でキャンセルしても、バケットにすでにアップロードされているデータは削除されません。</p>

</Admonition>

