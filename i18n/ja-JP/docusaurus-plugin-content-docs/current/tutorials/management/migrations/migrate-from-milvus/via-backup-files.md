---
title: "バックアップファイル経由で Milvus から Zilliz Cloud に移行 | Cloud"
slug: /via-backup-files
sidebar_label: "バックアップファイル経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、インフラを自分で管理することなく Milvus ベクトルデータベースを利用したいユーザー向けに、完全マネージドのクラウドホスト型ソリューションとして Milvus を提供します。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。 | Cloud"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# バックアップファイル経由で Milvus から Zilliz Cloud に移行

Zilliz Cloud は、インフラを自分で管理することなく Milvus ベクトルデータベースを利用したいユーザー向けに、完全マネージドのクラウドホスト型ソリューションとして Milvus を提供します。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。

## 開始する前に\{#before-you-start}

次の前提条件が満たされていることを確認してください。

- 移行方法に応じて、移行に必要な準備を行っていること。

    - **From Local File**: 事前にローカルのバックアップファイルを準備します。バックアップファイルの準備方法については、[移行用のバックアップファイルを準備する](./via-backup-files#prepare-backup-files-for-migration) を参照してください。

    - **From Object Storage**: Milvus オブジェクトストレージの公開 URL とアクセス認証情報を準備します。長期認証情報または一時認証情報を選択できます。オブジェクトストレージ URL の詳細な例については、[FAQ](./via-backup-files#faq) を参照してください。

        <Admonition type="info" icon="📘" title="Notes">

        低レイテンシで安定した利用体験を確保するため、ターゲットクラスターと同じプロバイダーかつ同じリージョンのバケットまたは blob コンテナーを使用することを推奨します。

        </Admonition>

    - **From Volume**: 

        - **Managed volume**: 非常に大きなローカルバックアップファイルの場合は、まずファイルを Zilliz Cloud の [managed volume](./managed-volume) にアップロードし、その後そのボリューム内のファイルパスを指定します。

        - **External volume**: バックアップファイルがクラウドオブジェクトストレージバケット内にある場合は、そのバケットにマッピングする [external volume](./external-volume) を作成します。これにより、毎回認証情報を提供することなく、外部ボリュームから直接データを移行できます。

- **Organization Owner** または **Project Admin** ロールが付与されていること。必要な権限がない場合は、Zilliz Cloud の Organization Owner に連絡してください。

- ターゲットクラスターの CU サイズがソースデータを収容できることを確認してください。必要な CU サイズを見積もるには、[calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator) を使用してください。

## 移行用のバックアップファイルを準備する\{#prepare-backup-files-for-migration}

Milvus 2.x の移行データを準備するには、

<Procedures>

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)** をダウンロードします。常に最新リリースを使用してください。

    現在、Milvus 2.2 以降のバージョンから Zilliz Cloud クラスターへデータを移行できます。互換性のあるソースおよびターゲットの Milvus バージョンの詳細については、[Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md) を参照してください。

1. ダウンロードしたバイナリと同じ階層に **configs** フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** を **configs** フォルダにダウンロードします。

    この手順が完了すると、ワークスペースフォルダの構成は次のようになります。

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml** をカスタマイズします。

    通常、このファイルをカスタマイズする必要はありません。ただし、先に進む前に、次の設定項目が正しいか確認してください。

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

    - Docker Compose を使用してインストールした Milvus インスタンスでは、`minio.bucketName` のデフォルト値は `a-bucket`、`rootPath` のデフォルト値は `files` です。
    
    - Kubernetes 上にインストールした Milvus インスタンスでは、`minio.bucketName` のデフォルト値は `milvus-bucket`、`rootPath` のデフォルト値は `file` です。

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

    - `minio.address` と `minio.port` を S3 バケットに設定した場合、バックアップファイルはすでにその S3 バケットに保存されています。

    - `minio.address` と `minio.port` を Minio バケットに設定した場合は、Minio Console または **mc** クライアントを使用してダウンロードできます。 

        - [Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html) からダウンロードするには、Minio Console にログインし、`minio.address` で指定されたバケットを見つけて、そのバケット内のファイルを選択し、**Download** をクリックしてダウンロードします。

        - [**mc** クライアント](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install) を使用したい場合は、次の手順に従ってください。

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

## Zilliz Cloud にデータを移行する\{#migrate-data-to-zilliz-cloud}

バックアップファイルの準備ができたら、ローカルファイル、オブジェクトストレージ、またはボリュームからデータを移行できます。

<Supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - Migrate from Milvus via Backup File Demo" />

<Admonition type="info" icon="📘" title="Notes">

ソースコレクションでフルテキスト検索がすでに有効になっている場合、Zilliz Cloud は移行後にその Function 設定をターゲットコレクションに保持します。これらの継承された設定は変更できません。

</Admonition>

## 移行プロセスを監視する\{#monitor-the-migration-process}

**Migrate** をクリックすると、移行ジョブが生成されます。[Jobs](./job-center) ページで移行の進行状況を確認できます。ジョブステータスが **In Progress** から **Successful** に変わると、移行は完了です。

<Supademo id="cme9my2nn4b64h3pyiyvsakqb" title="Zilliz Cloud - Monitor the Migration Process" />

<Admonition type="info" icon="📘" title="Notes">

移行後、ターゲットクラスター内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠けているコレクションを削除し、再度それらを移行してください。

</Admonition>

## 移行後\{#post-migration}

移行ジョブが完了したら、次の点に注意してください。

- **Index Creation**: 移行プロセスでは、移行されたコレクションに対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **Manual Loading Required**: 自動インデックス作成が行われても、移行されたコレクションはすぐに検索またはクエリ操作に使用できるわけではありません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

## 移行ジョブをキャンセルする\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、トラブルシューティングを行い、移行を再開するために次の手順を実行できます。

<Procedures>

1. [Jobs](./job-center) ページで、失敗した移行ジョブを見つけてキャンセルします。

1. **Actions** 列の **View Details** をクリックしてエラーログにアクセスします。

</Procedures>

## FAQ\{#faq}

1. **オブジェクトストレージバケットに保存されたバックアップファイルから移行する場合、どの形式の URL を使用すればよいですか。**

    次の表は、さまざまなオブジェクトストレージサービスの URL 例を示しています。バックアップファイルから移行する場合は、バックアップフォルダのみを選択できることに注意してください。

    <table>
       <tr>
         <th colspan="2"><p><strong>クラウドオブジェクトストレージ</strong></p></th>
         <th><p><strong>URL 形式</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><strong>Amazon S3</strong></p></td>
         <td><p>AWS Object URL, virtual-hosted–style</p></td>
         <td><p>https://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>AWS Object URL, path-style</p></td>
         <td><p>https://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>Amazon S3 URI</p></td>
         <td><p>s3://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Google Cloud Storage</strong></p></td>
         <td><p>GSC public URL</p></td>
         <td><p>https://storage.cloud.google.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>GSC gsutil URI</p></td>
         <td><p>gs://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Azure Blob Storage</strong></p></td>
         <td><p>https://&lt;storage_account&gt;.blob.core.windows.net/&lt;container&gt;/&lt;folder&gt;/</p></td>
       </tr>
    </table>
