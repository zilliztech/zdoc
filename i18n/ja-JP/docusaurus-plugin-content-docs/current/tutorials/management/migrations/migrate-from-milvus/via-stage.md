---
title: "バックアップ ツールを使用した Milvus から Zilliz Cloud への移行 | Cloud"
slug: /via-stage
sidebar_label: "バックアップ ツールを使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Milvus からのデータ移行用のバックアップ ツールを提供しています。このツールを利用することで、複雑な手動作業なしにデータ移行をより簡単かつ効率的に行え、使いやすさと成功率が大幅に向上します。 | Cloud"
type: origin
token: IxO5wZ1meiYrTckUPkQca9JOnbS
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# バックアップ ツールを使用した Milvus から Zilliz Cloud への移行

Zilliz Cloud は、Milvus からのデータ移行用のバックアップ ツールを提供しています。このツールを利用することで、複雑な手動作業なしにデータ移行をより簡単かつ効率的に行え、使いやすさと成功率が大幅に向上します。

この機能により、以下のようなさまざまな移行シナリオにおける運用上の複雑さが解消されます。

- ローカル バックアップ ファイルを使用した移行時のファイル サイズ制限。

- バケットベースの移行を行う際に、クラウド プロバイダーごとに異なるストレージ バケット設定を理解する手間。

- エンドポイントベースの移行を実行する際に、Milvus インスタンスのエンドポイントへのネットワーク接続性を確保する手間。

## 事前準備\{#before-you-start}

- **Organization Owner** または **Project Admin** ロールが付与されている必要があります。必要な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- 移行先クラスターのクエリ CU 数がソース データを収容できることを確認してください。必要なクエリ CU 数を見積もるには、[calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator) を使用します。

## 手順\{#procedure}

この手順では、Milvus Backup を使用してバックアップ ファイルを準備し、Zilliz Cloud にアップロードしてから、指定した移行先 Zilliz Cloud クラスターへ移行します。

<Procedures>

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)** をダウンロードします。常に最新リリースを使用してください。

    現在、Milvus 2.2 以降のバージョンから Zilliz Cloud クラスターへのデータ移行が可能です。互換性のあるソースおよびターゲット Milvus バージョンの詳細については、[Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md) を参照してください。

1. ダウンロードしたバイナリと同じ階層に **configs** フォルダーを作成し、その中に **[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** をダウンロードします。

    この手順が完了すると、ワークスペース フォルダーの構造は次のようになります。

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml** をカスタマイズします。

    1. 以下の設定項目を設定します。

        ```yaml
        ...
        cloud:
          address: https://api.cloud.zilliz.com
          apikey: <your-api-key>
        ...
        ```

        - `cloud.address`

            Zilliz Cloud Control Plane エンドポイント（`https://api.cloud.zilliz.com`）。

        - `cloud.apikey`

            移行先クラスターを操作するための十分な権限を持つ有効な Zilliz Cloud API キー。詳細については、[API Keys](./manage-api-keys) を参照してください。

    1. 以下の設定項目が正しいか確認します。

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

    - Docker Compose でインストールされた Milvus インスタンスの場合、`minio.bucketName` のデフォルト値は `a-bucket`、`rootPath` のデフォルト値は `files` です。
    
    - Kubernetes にインストールされた Milvus インスタンスの場合、`minio.bucketName` のデフォルト値は `milvus-bucket`、`rootPath` のデフォルト値は `file` です。

    </Admonition>

1. Milvus インストール環境のバックアップを作成します。

    ```bash
    ./milvus-backup --config backup.yaml create -n my_backup
    
    # my_backup is the name of the backup file 
    # and will be used in the migrate command
    ```

1. 移行先 Zilliz Cloud クラスターを作成してクラスター ID を控え、次のコマンドを実行して移行を開始します。

    ```bash
    ./milvus-backup migrate --cluster_id inxx-xxxxxxxxxxxxxxx -n my_backup
    
    # cluster_id is the ID of the target Zilliz Cloud cluster
    # my_backup is the name of the backup file created in the above command
    
    # The command output is similar to the following:
    # Successfully triggered migration with backup name: my_backup target cluster: inxx-xxxxxxxxxxxxxxx migration job id: job-xxxxxxxxxxxxxxxxxxx.
    # You can check the progress of the migration job in Zilliz Cloud console.
    ```

    このコマンドを実行すると、Milvus Backup が準備されたバックアップ ファイルを Zilliz Cloud プラットフォームにアップロードし、移行ジョブを作成して、コマンド出力としてジョブ ID を返します。

    <Admonition type="info" icon="📘" title="Notes">

    Zilliz Cloud プラットフォームにアップロードされたバックアップ ファイルは、アップロード後 **3** 日間保持され、その後削除されます。

    </Admonition>

</Procedures>

## 移行プロセスの監視\{#monitor-the-migration-process}

**Migrate** をクリックすると移行ジョブが生成されます。移行の進行状況は [Jobs](./job-center) ページで確認できます。ジョブのステータスが **In Progress** から **Successful** に変わると、移行完了です。

<Admonition type="info" icon="📘" title="Notes">

移行後、移行先クラスター内のコレクション数とエンティティ数が移行元と一致していることを確認します。不一致が見つかった場合は、エンティティが不足しているコレクションを削除して再移行してください。

</Admonition>

![verify_collection](https://zdoc-images.s3.us-west-2.amazonaws.com/verifycollection.png "verify_collection")

## 移行後の作業\{#post-migration}

移行ジョブ完了後は、以下の点にご注意ください。

- **インデックス作成**: 移行プロセスにより、移行されたコレクションに対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **手動ロードが必要**: インデックスは自動で作成されますが、移行直後のコレクションは検索やクエリ操作に使用できません。検索およびクエリ機能を利用するには、Zilliz Cloud でコレクションを手動ロードする必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

## 移行ジョブのキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、以下の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [Jobs](./job-center) ページで失敗した移行ジョブを特定し、キャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログを確認します。

</Procedures>
