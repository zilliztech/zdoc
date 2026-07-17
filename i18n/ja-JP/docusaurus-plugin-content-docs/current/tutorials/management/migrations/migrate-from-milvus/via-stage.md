---
title: "バックアップツールを使用して Milvus から Zilliz Cloud に移行 | Cloud"
slug: /via-stage
sidebar_label: "バックアップツールを使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Milvus からのデータ移行のためのバックアップツールを提供しています。このバックアップツールにより、複雑な詳細を手動で扱う必要なく、より簡単かつ効率的にデータ移行を実行でき、使いやすさと成功率が大幅に向上します。 | Cloud"
type: origin
token: IxO5wZ1meiYrTckUPkQca9JOnbS
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# バックアップツールを使用して Milvus から Zilliz Cloud に移行

Zilliz Cloud は、Milvus からのデータ移行のためのバックアップツールを提供しています。このバックアップツールにより、複雑な詳細を手動で扱う必要なく、より簡単かつ効率的にデータ移行を実行でき、使いやすさと成功率が大幅に向上します。

この機能により、次のようなさまざまな移行シナリオにおける運用の複雑さが解消されます。

- ローカルのバックアップファイルを使用して移行する際のファイルサイズ制限。

- bucket ベースの移行を使用する際に、異なるクラウドプロバイダーのクラウドストレージ bucket 構成を理解する必要があること。

- endpoint ベースの移行を実行する際に、Milvus インスタンスの endpoint へのネットワークアクセス性を確保する必要があること。

## 開始前の準備\{#before-you-start}

- **Organization Owner** または **Project Admin** ロールが付与されている必要があります。必要な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- ターゲット cluster の query CU 数が、ソースデータを収容できることを確認してください。必要な query CU 数を見積もるには、[calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator) を使用してください。

## 手順\{#procedure}

この手順では、Milvus Backup を使用してバックアップファイルを準備し、それらを Zilliz Cloud にアップロードして、指定したターゲット Zilliz Cloud cluster に移行します。

<Procedures>

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)** をダウンロードします。必ず最新リリースを使用してください。

    現在、Milvus 2.2 以降のバージョンから Zilliz Cloud cluster へデータを移行できます。互換性のあるソースおよびターゲット Milvus バージョンの詳細については、[Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md) を参照してください。

1. ダウンロードしたバイナリと同じ階層に **configs** フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** を **configs** フォルダにダウンロードします。

    この手順が完了すると、ワークスペースフォルダの構成は次のようになります。

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml** をカスタマイズします。

    1. 次の設定項目を設定します。

        ```yaml
        ...
        cloud:
          address: https://api.cloud.zilliz.com
          apikey: <your-api-key>
        ...
        ```

        - `cloud.address`

            `https://api.cloud.zilliz.com` である Zilliz Cloud Control Plane endpoint です。

        - `cloud.apikey`

            移行先ターゲット cluster を操作するための十分な権限を持つ、有効な Zilliz Cloud API key です。詳細については、[API Keys](./manage-api-keys) を参照してください。

    1. 次の設定項目が正しいか確認します。

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

    <Admonition type="info" icon="📘" title="📘 Notes">

    - Docker Compose を使用してインストールされた Milvus インスタンスでは、`minio.bucketName` のデフォルトは `a-bucket`、`rootPath` のデフォルトは `files` です。
    
    - Kubernetes 上にインストールされた Milvus インスタンスでは、`minio.bucketName` のデフォルトは `milvus-bucket`、`rootPath` のデフォルトは `file` です。

    </Admonition>

1. Milvus インストール環境のバックアップを作成します。

    ```bash
    ./milvus-backup --config backup.yaml create -n my_backup
    
    # my_backup is the name of the backup file 
    # and will be used in the migrate command
    ```

1. ターゲット Zilliz Cloud cluster を作成し、cluster ID を控えてから、次のコマンドを実行して移行を開始します。

    ```bash
    ./milvus-backup migrate --cluster_id inxx-xxxxxxxxxxxxxxx -n my_backup
    
    # cluster_id is the ID of the target Zilliz Cloud cluster
    # my_backup is the name of the backup file created in the above command
    
    # The command output is similar to the following:
    # Successfully triggered migration with backup name: my_backup target cluster: inxx-xxxxxxxxxxxxxxx migration job id: job-xxxxxxxxxxxxxxxxxxx.
    # You can check the progress of the migration job in Zilliz Cloud console.
    ```

    このコマンドを実行すると、Milvus Backup は準備したバックアップファイルを Zilliz Cloud プラットフォームにアップロードし、migration job を作成して、コマンド出力として job ID を返します。

    <Admonition type="info" icon="📘" title="Notes">

    Zilliz Cloud プラットフォームにアップロードされたバックアップファイルは、アップロード後 **3** 日間保持され、その後削除されます。

    </Admonition>

</Procedures>

## 移行プロセスの監視\{#monitor-the-migration-process}

**Migrate** をクリックすると、migration job が生成されます。[Jobs](./job-center) ページで移行の進行状況を確認できます。job ステータスが **In Progress** から **Successful** に切り替わると、移行は完了です。

<Admonition type="info" icon="📘" title="Notes">

移行後、ターゲット cluster 内の collections と entities の数がデータソースと一致していることを確認してください。不一致が見つかった場合は、entities が不足している collections を削除し、再度移行してください。

</Admonition>

![verify_collection](https://zdoc-images.s3.us-west-2.amazonaws.com/verifycollection.png "verify_collection")

## 移行後\{#post-migration}

migration job の完了後は、次の点に注意してください。

- **Index の作成**: 移行プロセスでは、移行された collections に対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **手動でのロードが必要**: 自動 indexing が行われても、移行された collections はすぐに検索や query 操作に利用できる状態にはなりません。検索および query 機能を有効にするには、Zilliz Cloud で collections を手動でロードする必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

## migration job のキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、次の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [Jobs](./job-center) ページで、失敗した migration job を特定してキャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログにアクセスします。

</Procedures>
