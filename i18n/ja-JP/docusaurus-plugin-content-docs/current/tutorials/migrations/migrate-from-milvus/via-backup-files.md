---
title: "バックアップファイルを使用してMilvusからZilliz Cloudに移行する | Cloud"
slug: /via-backup-files
sidebar_label: "Via Backup Files"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、Milvusベクトルデータベースを使用したいユーザー向けに、Milvusを完全に管理されたクラウドホストソリューションとして提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。 | Cloud"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - backup files
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';


# バックアップファイルを使用してMilvusからZilliz Cloudに移行する

Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、Milvusベクトルデータベースを使用したいユーザー向けに、Milvusを完全に管理されたクラウドホストソリューションとして提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。

このトピックでは、バックアップファイルを直接アップロードしてMilvusから移行する方法について説明します。データベースエンドポイントを介してデータを移行する方法については、[エンドポイント経由](./via-endpoint)を参照してください。

## 始める前に{#before-you-start}

次の前提条件が満たされていることを確認してください。

- 移行方法に基づいて、移行に必要な準備を行いました。

    - **ローカルファイルから**:事前にローカルバックアップファイルを準備してください。バックアップファイルの準備方法については、[移行のためのバックアップファイルを準備する](./via-backup-files#prepare-backup-files-for-migration)を参照してください。

    - **オブジェクトストレージから**: Milvusオブジェクトストレージの公開URLとアクセス資格情報。長期または一時的な資格情報を選択できます。

- **組織オーナー**または**プロジェクト管理者**の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- ターゲットクラスタのCU体格がソースデータを収容できることを確認してください。必要なCU体格を推定するには、[電卓](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator)を使用してください。

## 移行のためのバックアップファイルを準備する{#prepare-backup-files-for-migration}

Milvus 2. xの移行データを準備するには、

1. **[milvusのバックアップ](https://github.com/zilliztech/milvus-backup/releases)**をダウンロードしてください。常に最新リリースを使用してください。

    現在、Milvus 2.2以降のバージョンのデータをZilliz Cloudクラスターに移行することができます。互換性のあるソースとターゲットのMilvusバージョンの詳細については、[Milvusバックアップの概要](https://milvus.io/docs/milvus_backup_overview.md)を参照してください。

1. ダウンロードしたバイナリと並べて**configs**フォルダを作成し、**[バックアップ. yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)**を**configs**フォルダにダウンロードしてください。

    ステップが完了すると、ワークスペースフォルダの構造は次のようになります:

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup. yaml**をカスタマイズしてください。

    通常の場合、このファイルをカスタマイズする必要はありません。しかし、先に進む前に、以下の設定項目が正しいかどうかを確認してください:

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    <Admonition type="info" icon="📘" title="ノート">

    <ul>
    <li><p>Docker Composeを使用してインストールされたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>a-bucket</code>であり、<code>rootPath</code>のデフォルトは<code>files</code>です。</p></li>
    <li><p>KubernetesにインストールされたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>milvus-bucket</code>であり、<code>rootPath</code>のデフォルトは<code>file</code>です。</p></li>
    </ul>

    </Admonition>

1. Milvusインストールのバックアップを作成します。

    ```plaintext
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. バックアップファイルを取得します。

    ```plaintext
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. バックアップファイルを確認してください。

    - `minio.address`と`minio.port`をS 3バケットに設定した場合、バックアップファイルはすでにS 3バケットにあります。

    - `minio.address`と`minio.port`をMinioバケットに設定すると、Minioコンソールまたは**mc**クライアントを使用してダウンロードできます。 

        - [Minioコンソール](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html)からダウンロードするには、Minioコンソールにログインし、`minio.address`で指定されたバケットを探し、バケット内のファイルを選択して、**ダウンロード**をクリックしてダウンロードしてください。

        - [ザ・ ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[ クライアント](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)を好む場合は、以下のようにしてください:

            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. ダウンロードしたアーカイブを解凍し、**バックアップ**フォルダの内容のみをZilliz Cloudにアップロードしてください。

## Zilliz Cloudへのデータ移行{#migrate-data-to-zilliz-cloud}

バックアップファイルが準備できたら、ローカルファイルから直接またはオブジェクトストレージからデータを移行できます。

<supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - Migrate from Milvus via Backup File Demo"></supademo>

## 移行過程を監視する{#monitor-the-migration-process}

「移行」をクリックすると、移行ジョブが生成されます。[仕事](./job-center)ページで移行の進捗状況を確認できます。ジョブの状態が「進行中」から「成功」に切り替わると、移行は完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## ポストマイグレーション{#post-migration}

移行ジョブが完了したら、次の点に注意してください。

- インデックスの作成:移行過程で、移行されたコレクションの[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- 手動ロードが必要です:自動インデックス化されているにもかかわらず、移行されたコレクションはすぐに検索またはクエリ操作に利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロード&リリース](./load-release-collections)を参照してください。

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[仕事](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. エラーログにアクセスするには、**アクション**列の**詳細を表示**をクリックしてください。

