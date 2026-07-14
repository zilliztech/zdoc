---
title: "バックアップファイルを介して Milvus から Zilliz Cloud に移行 | BYOC"
slug: /via-backup-files
sidebar_label: "バックアップファイル経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Milvus vector database を自身でインフラ管理することなく利用したいユーザー向けに、完全マネージドなクラウドホスト型ソリューションとして Milvus を提供します。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。 | BYOC"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# バックアップファイルを介して Milvus から Zilliz Cloud に移行

Zilliz Cloud は、Milvus vector database を自身でインフラ管理することなく利用したいユーザー向けに、完全マネージドなクラウドホスト型ソリューションとして Milvus を提供します。このトピックでは、バックアップファイルを直接アップロードして Milvus から移行する方法について説明します。

## 開始前に\{#before-you-start}

次の前提条件を満たしていることを確認してください。

- 移行方法に応じて、移行に必要な準備を行っていること。

    - **From Local File**: 事前にローカルのバックアップファイルを準備してください。バックアップファイルの準備方法については、[移行用バックアップファイルの準備](./via-backup-files#prepare-backup-files-for-migration) を参照してください。

    - **From Object Storage**: Milvus object storage の公開 URL とアクセス認証情報。長期認証情報または一時認証情報を選択できます。object storage URL の詳細な例については、[FAQ](./via-backup-files#faq) を参照してください。

        <Admonition type="info" icon="📘" title="Notes">

        低レイテンシで安定した体験を確保するため、ターゲット cluster と同じプロバイダーかつ同じリージョンの bucket または blob container を使用することを推奨します。

        </Admonition>

- **Organization Owner** または **Project Admin** ロールが付与されていること。必要な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- ターゲット cluster の CU サイズがソースデータを収容できることを確認してください。必要な CU サイズを見積もるには、[calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator) を使用してください。

## 移行用バックアップファイルの準備\{#prepare-backup-files-for-migration}

Milvus 2.x の移行データを準備するには、

<Procedures>

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)** をダウンロードします。必ず最新リリースを使用してください。

    現在、Milvus 2.2 以降のバージョンから Zilliz Cloud clusters へデータを移行できます。互換性のあるソースおよびターゲットの Milvus バージョンの詳細については、[Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md) を参照してください。

1. ダウンロードしたバイナリと同じ階層に **configs** フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** を **configs** フォルダにダウンロードします。

    この手順が完了すると、ワークスペースフォルダの構成は次のようになります。

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml** をカスタマイズします。

    通常、このファイルをカスタマイズする必要はありません。ただし、続行する前に、次の設定項目が正しいか確認してください。

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

    ```plaintext
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. バックアップファイルを取得します。

    ```plaintext
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. バックアップファイルを確認します。

    - `minio.address` と `minio.port` を S3 bucket に設定した場合、バックアップファイルはすでにその S3 bucket 内にあります。

    - `minio.address` と `minio.port` を Minio bucket に設定した場合、Minio Console または **mc** クライアントを使用してダウンロードできます。 

        - [Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html) からダウンロードするには、Minio Console にログインし、`minio.address` で指定した bucket を見つけ、bucket 内のファイルを選択して、**Download** をクリックしてダウンロードします。

        - [the ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[ client](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install) を使用する場合は、次のようにします。

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

## データを Zilliz Cloud に移行\{#migrate-data-to-zilliz-cloud}

バックアップファイルの準備ができたら、ローカルファイルからデータを移行できます。

<Supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - Migrate from Milvus via Backup File Demo" />

<Admonition type="info" icon="📘" title="Notes">

ソース collection ですでに全文検索が有効になっている場合、Zilliz Cloud は移行後のターゲット collection にその Function 設定を保持します。これらの継承された設定は変更できません。

</Admonition>

## 移行プロセスの監視\{#monitor-the-migration-process}

**Migrate** をクリックすると、移行ジョブが生成されます。移行の進行状況は [Jobs](./job-center) ページで確認できます。ジョブステータスが **In Progress** から **Successful** に切り替わると、移行は完了です。

<Supademo id="cme9my2nn4b64h3pyiyvsakqb" title="Zilliz Cloud - Monitor the Migration Process" />

<Admonition type="info" icon="📘" title="Notes">

移行後、ターゲット cluster 内の collections 数と entities 数がデータソースと一致していることを確認してください。不一致が見つかった場合は、欠落している entities を含む collections を削除して、再度移行してください。

</Admonition>

## 移行後\{#post-migration}

移行ジョブの完了後は、次の点に注意してください。

- **Index Creation**: 移行プロセスでは、移行された collections に対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **Manual Loading Required**: 自動 indexing が行われても、移行された collections はすぐには検索またはクエリ操作に使用できません。検索およびクエリ機能を有効にするには、Zilliz Cloud で collections を手動で load する必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

## 移行ジョブのキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、次の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [Jobs](./job-center) ページで、失敗した移行ジョブを特定してキャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログを確認します。

</Procedures>

## FAQ\{#faq}

1. **object storage bucket に保存されているバックアップファイルから移行する場合、どの URL 形式に従えばよいですか。**

    次の表は、異なる object storage サービスの URL 例を示しています。バックアップファイルから移行する場合は、バックアップフォルダのみを選択できる点に注意してください。

    <table>
       <tr>
         <th colspan="2"><p><strong>Cloud Object Storage</strong></p></th>
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
