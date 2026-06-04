---
title: "バックアップファイルを使用した Milvus から Zilliz Cloud への移行 | BYOC"
slug: /via-backup-files
sidebar_key: via-backup-files
sidebar_label: "バックアップファイルを使用"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Milvus ベクトルデータベースを利用したいが、インフラストラクチャの管理を自分で行いたくないユーザー向けに、Milvus をフルマネージドのクラウドホスト型ソリューションとして提供しています。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。 | BYOC"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 移行
  - milvus
  - バックアップファイル

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# バックアップファイルを使用した Milvus から Zilliz Cloud への移行

Zilliz Cloud は、Milvus ベクトルデータベースを使用したいが、インフラストラクチャの管理を自分で行いたくないユーザー向けに、Milvus をフルマネージドのクラウドホスト型ソリューションとして提供しています。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。

## 開始前に\{#before-you-start}

以下の前提条件が満たされていることを確認してください：

- 移行方法に基づいて、必要な準備を完了していること：

    - **ローカルファイルから**: 事前にローカルのバックアップファイルを準備してください。バックアップファイルの準備方法については、[移行用バックアップファイルの準備](./via-backup-files#prepare-backup-files-for-migration) を参照してください。

    - **オブジェクトストレージから**: Milvus オブジェクトストレージのパブリック URL とアクセス認証情報。長期または一時的な認証情報を選択できます。オブジェクトストレージ URL の詳細な例については、[FAQ](./via-backup-files#faq) を参照してください。

        <Admonition type="info" icon="📘" title="Notes">

        <p>低レイテンシで安定したエクスペリエンスを確保するために、ターゲットクラスタと同じプロバイダ、同じリージョンのバケットまたは BLOB コンテナを使用することをお勧めします。</p>

        </Admonition>

- **組織オーナー** または **プロジェクト管理者** のロールが付与されていること。必要な権限がない場合は、Zilliz Cloud の組織オーナーに連絡してください。

- ターゲットクラスターの CU サイズがソースデータを収容できることを確認してください。必要な CU サイズを見積もるには、[calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator) を使用してください。

## 移行用バックアップファイルの準備\{#prepare-backup-files-for-migration}

Milvus 2.x の移行データを準備するには、

<Procedures>

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)** をダウンロードしてください。常に最新のリリースを使用してください。

    現在、Milvus 2.2 以降のバージョンから Zilliz Cloud クラスターにデータを移行できます。互換性のあるソースおよびターゲットの Milvus バージョンの詳細については、[Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md) を参照してください。

1. ダウンロードしたバイナリと同じ階層に **configs** フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** を **configs** フォルダにダウンロードしてください。

    この手順が完了すると、ワークスペースフォルダの構造は次のようになります：

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml** をカスタマイズします。

    通常の場合、このファイルをカスタマイズする必要は～しません。ただし、続行する前に、以下の設定項目が正しいかどうかを確認してください：

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

    <Admonition type="info" icon="📘" title="Notes">

    - Docker Compose でインストールされた Milvus インスタンスの場合、`minio.bucketName` のデフォルト値は `a-bucket`、`rootPath` のデフォルト値は `files` です。

    - Kubernetes でインストールされた Milvus インスタンスの場合、`minio.bucketName` のデフォルト値は `milvus-bucket`、`rootPath` のデフォルト値は `file` です。

    </Admonition>

1. Milvus インストールのバックアップを作成します。

    ```plaintext
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. バックアップファイルを取得します。

    ```plaintext
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. バックアップファイルを確認します。

    - `minio.address` と `minio.port` を S3 バケットに設定した場合、バックアップファイルは既に S3 バケットに存在します。

    - `minio.address` と `minio.port` を Minio バケットに設定した場合、Minio Console または **mc** クライアントを使用してダウンロードできます。

        - [Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html) からダウンロードするには、Minio Console にログインし、`minio.address` で指定されたバケットを見つけ、バケット内のファイルを選択して、**ダウンロード** をクリックしてダウンロードします。

        - [mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install) クライアントを使用する場合は、以下の手順を実行します。

            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. ダウンロードしたアーカイブを解凍し、**backup** フォルダの内容のみを Zilliz Cloud にアップロードします。

</Procedures>

## Zilliz Cloud へのデータ移行\{#migrate-data-to-zilliz-cloud}

バックアップファイルの準備ができたら、ローカルファイルからデータを移行できます。

<Supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - Migrate from Milvus via Backup File Demo" />

<Admonition type="info" icon="📘" title="Notes">

ソースコレクションで全文検索が既に有効になっている場合、Zilliz Cloud は移行後にターゲットコレクションでその Function 設定を保持します。これらの継承された設定は変更できません。

</Admonition>

## 移行プロセスの監視\{#monitor-the-migration-process}

**Migrate** をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center) ページで移行の進捗状況を確認できます。ジョブのステータスが **進行中** から **成功** に変わると、移行は完了です。

<Supademo id="cme9my2nn4b64h3pyiyvsakqb" title="Zilliz Cloud - Monitor the Migration Process" />

<Admonition type="info" icon="📘" title="Notes">

移行後、ターゲットクラスターのコレクション数とエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合、エンティティが欠落しているコレクションを削除し、再移行してください。

</Admonition>

## 移行後\{#post-migration}

移行ジョブが完了した後、以下の点に注意してください。

- **インデックス作成**: 移行プロセスでは、移行されたコレクションに対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **手動ロードが必要です**: 自動インデックス作成が行われても、移行されたコレクションは検索やクエリ操作をすぐに利用できる状態にはなりません。Zilliz Cloud でコレクションを手動でロードし、検索およびクエリ機能を有効にする必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

## 移行ジョブのキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、以下の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [ジョブ](./job-center) ページで、失敗した移行ジョブを特定し、キャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログにアクセスします。

</Procedures>

## FAQ\{#faq}

1. **オブジェクトストレージバケットに保存されたバックアップファイルから移行する場合、どのような形式の URL に従うべきですか？**

    以下の表は、異なるオブジェクトストレージサービスの URL の例を示しています。バックアップファイルから移行する場合、バックアップフォルダのみを選択できることに注意してください。

    <table>
       <tr>
         <th colspan="2"><p><strong>Cloud Object Storage</strong></p></th>
         <th><p><strong>URL Format</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><strong>Amazon S3</strong></p></td>
         <td><p>AWS Object URL, virtual-hosted–style</p></td>
         <td><p><i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>AWS Object URL, path-style</p></td>
         <td><p><i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>Amazon S3 URI</p></td>
         <td><p>s3://\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Google Cloud Storage</strong></p></td>
         <td><p>GSC public URL</p></td>
         <td><p><i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>GSC gsutil URI</p></td>
         <td><p>gs://\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Azure Blob Storage</strong></p></td>
         <td><p><i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<folder>/</p></td>
       </tr>
    </table>
