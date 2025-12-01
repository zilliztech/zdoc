---
title: "バックアップツール経由でMilvusからZilliz Cloudに移行 | Cloud"
slug: /via-stage
sidebar_label: "バックアップツール経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Milvusからのデータ移行用にバックアップツールを提供します。このバックアップツールにより、ユーザーは手動で複雑な詳細を処理することなく、より簡単かつ効率的にデータ移行を実行できるようになり、ユーザビリティと成功率が大幅に向上します。 | Cloud"
type: origin
token: IxO5wZ1meiYrTckUPkQca9JOnbS
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - backup files
  - volume
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots

---

import Admonition from '@theme/Admonition';


# バックアップツール経由でMilvusからZilliz Cloudに移行

Zilliz Cloudは、Milvusからのデータ移行用にバックアップツールを提供します。このバックアップツールにより、ユーザーは手動で複雑な詳細を処理することなく、より簡単かつ効率的にデータ移行を実行できるようになり、ユーザビリティと成功率が大幅に向上します。

この機能は、以下のようなさまざまな移行情報シナリオの運用の複雑さを排除します：

- ローカルバックアップファイルで移行する際のファイルサイズ制限

- バケットベースの移行時に異なるクラウドプロバイダーのクラウドストレージバケット構成を理解する。

- エンドポイントベースの移行を実行する際にMilvusインスタンスエンドポイントのネットワークアクセシビリティを確保する。

## 始める前に\{#before-you-start}

- あなたは**組織オーナー**または**プロジェクト管理者**ロールが付与されていること。必要な権限がない場合は、Zilliz Cloud組織オーナーに連絡してください。

- ターゲットクラスターのクエリCU数がソースデータを収容できることを確認してください。必要なクエリCU数を推定するには、[計算機](https://zilliz.com/pricing?_gl=1*qro801*_ga=MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator)を使用してください。

## 手順\{#procedure}

この手順では、Milvusバックアップを使用してバックアップファイルを準備し、それらをZilliz Cloudにアップロードして、指定されたターゲットZilliz Cloudクラスターに移行します。

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)**をダウンロードします。常に最新のリリースを使用してください。

    現在、Milvus 2.2以降のバージョンからZilliz Cloudクラスターにデータを移行できます。互換性のあるソースおよびターゲットのMilvusバージョンの詳細については、[Milvusバックアップの概要](https://milvus.io/docs/milvus_backup_overview.md)を参照してください。

1. ダウンロードしたバイナリと並列に**configs**フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)**を**configs**フォルダにダウンロードします。

    手順が完了すると、ワークスペースフォルダの構造は次のようになります：

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml**をカスタマイズします。

    1. 以下の構成項目を設定します：

        ```yaml
        ...
        cloud:
          address: https://api.cloud.zilliz.com
          apikey: <your-api-key>
        ...
        ```

        - `cloud.address`

            Zilliz Cloudコントロールプレーンエンドポイントで、`https://api.cloud.zilliz.com`です。

        - `cloud.apikey`

            移行対象クラスターを操作するのに十分な権限を持つ有効なZilliz Cloud APIキー。詳細については、[APIキー](./manage-api-keys)を参照してください。

    1. 以下の構成項目が正しいかどうかを確認します：

        ```yaml
        ...
        # milvus proxy address, compatible to milvus.yaml
        milvus:
          address: localhost
          port: 19530
          ...
          
        # Related configuration of minio, which is responsible for data persistence for Milvus.
        minio:
          # Milvus storage configs, make them the same with milvus config
          storageType: "minio" # support storage type: local, minio, s3, aws, gcp, ali(aliyun), azure, tc(tencent), gcpnative
          # You can use "gcpnative" for the Google Cloud Platform provider. Uses service account credentials for authentication.
          address: localhost # Address of MinIO/S3
          port: 9000   # Port of MinIO/S3
          bucketName: "a-bucket" # Milvus Bucket name in MinIO/S3, make it the same as your milvus instance
          backupBucketName: "a-bucket" # Bucket name to store backup data. Backup data will store to backupBucketName/backupRootPath
          rootPath: "files" # Milvus storage root path in MinIO/S3, make it the same as your milvus instance
          ...
        ```

    <Admonition type="info" icon="📘" title="注意">

    <ul>
    <li><p>Docker Composeを使用してインストールしたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>a-bucket</code>で、<code>rootPath</code>のデフォルトは<code>files</code>です。</p></li>
    <li><p>KubernetesにインストールしたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>milvus-bucket</code>で、<code>rootPath</code>のデフォルトは<code>file</code>です。</p></li>
    </ul>

    </Admonition>

1. Milvusインストールのバックアップを作成します。

    ```bash
    ./milvus-backup --config backup.yaml create -n my_backup
    
    # my_backup はバックアップファイルの名前
    # そして移行コマンドで使用されます
    ```

1. ターゲットZilliz Cloudクラスターを作成し、クラスターIDをメモして、以下のコマンドを実行して移行を開始します。

    ```bash
    ./milvus-backup migrate --cluster_id inxx-xxxxxxxxxxxxxxx -n my_backup
    
    # cluster_id はターゲットZilliz CloudクラスターのIDです
    # my_backup は上記のコマンドで作成されたバックアップファイル名です
    
    # コマンド出力は以下のようになります：
    # Successfully triggered migration with backup name: my_backup target cluster: inxx-xxxxxxxxxxxxxxx migration job id: job-xxxxxxxxxxxxxxxxxxx.
    # Zilliz Cloudコンソールで移行ジョブの進行状況を確認できます。
    ```

    このコマンドを実行すると、Milvusバックアップは準備したバックアップファイルをZilliz Cloud内部ステージにアップロードし、移行ジョブを作成して、コマンド出力としてジョブIDを返します。

    <Admonition type="info" icon="📘" title="注意">

    <p>Zilliz Cloud プラットフォームにアップロードされたバックアップファイルは、アップロード後<strong>3日間</strong>保持され、その後削除されます。</p>

    </Admonition>

## 移行プロセスを監視\{#monitor-the-migration-process}

**移行**をクリックすると、移行ジョブが生成されます。移行の進行状況は[ジョブ](./job-center)ページで確認できます。ジョブステータスが**進行中**から**成功**に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="注意">

<p>移行後、ターゲットクラスターのコレクション数およびエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## 移行後\{#post-migration}

移行ジョブが完了した後、以下の点に注意してください：

- **インデックス作成**: 移行プロセスでは、移行されたコレクションに対して[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- **手動でのロードが必要**: 自動インデックス作成にもかかわらず、移行されたコレクションは検索またはクエリ操作に対してすぐに使用可能にはなりません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロードとリリース](./load-release-collections)を参照してください。

## 移行ジョブをキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合、以下の手順に従ってトラブルシューティングおよび移行を再開できます：

1. [ジョブ](./job-center)ページで、失敗した移行ジョブを特定してキャンセルします。

1. **アクション**列の**詳細を表示**をクリックしてエラーログにアクセスします。

