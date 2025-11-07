---
title: "バックアップファイル経由でMilvusからZilliz Cloudに移行 | Cloud"
slug: /via-backup-files
sidebar_label: "バックアップファイル経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、インフラストラクチャの管理を自分で行う必要なく、Milvusベクターデータベースを使用したいユーザー向けに、完全管理型のクラウドホステッドソリューションとしてMilvusを提供します。このトピックでは、バックアップファイルを直接アップロードしてMilvusから移行する方法について説明します。 | Cloud"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - milvus
  - バックアップファイル
  - milvusベクターデータベース
  - Zilliz Cloud
  - milvusとは何か
  - milvusデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MilvusからZilliz Cloudへの移行（バックアップファイル経由）

Zilliz Cloudは、インフラストラクチャ管理を自分で行う必要なくMilvusベクターデータベースを使用したいユーザーのために、完全に管理されたクラウドホスト型ソリューションとしてMilvusを提供します。このトピックでは、バックアップファイルを直接アップロードしてMilvusから移行する方法について説明します。

## 事前準備\{#before-you-start}

以下の前提条件が満たされていることを確認してください：

- 以下に従って移行に必要な準備を完了していること：

    - **ローカルファイルから**：事前にローカルバックアップファイルを準備してください。バックアップファイルの準備方法については、[移行用バックアップファイルを準備](./via-backup-files#prepare-backup-files-for-migration)を参照してください。

    - **オブジェクトストレージから**：MilvusオブジェクトストレージのパプリックURLおよびアクセス認証情報。長期または一時的な認証情報を選択できます。オブジェクトストレージURLの詳細な例については、[FAQ](./via-backup-files#faq)を参照してください。

- **組織オーナー**または**プロジェクト管理者**ロールが付与されていること。必要な権限がない場合は、Zilliz Cloud組織オーナーに連絡してください。

- ターゲットクラスターのCUサイズがソースデータを収容できることを確認してください。必要なCUサイズの見積もりには、[計算機](https://zilliz.com/pricing)を使用してください。

## 移行用バックアップファイルを準備\{#prepare-backup-files-for-migration}

Milvus 2.xの移行データを準備するには、

1. **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)**をダウンロードします。常に最新のリリースを使用してください。

    現在、Milvus 2.2以降のバージョンからZilliz Cloudクラスターにデータを移行できます。互換性のあるソースおよびターゲットのMilvusバージョンについては、[Milvusバックアップ概要](https://milvus.io/docs/milvus_backup_overview.md)を参照してください。

1. ダウンロードしたバイナリと同じ階層に**configs**フォルダを作成し、**[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)**を**configs**フォルダにダウンロードします。

    作業が完了すると、workspaceフォルダの構造は次のようになります：

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup.yaml**をカスタマイズします。

    通常、このファイルをカスタマイズする必要はありません。ただし、進む前に以下の構成項目が正しいことを確認してください：

    ```yaml
    ...
    # milvusプロキシアドレス、milvus.yamlとの互換性あり
    milvus:
      address: localhost
      port: 19530
      ...
      
    # MinIOの関連構成、Milvusのデータ永続化を担当します。
    minio:
      # Milvusストレージ構成、milvus構成と同じにします
      storageType: "minio" # サポートされるストレージタイプ：local、minio、s3、aws、gcp、ali(アリババ)、azure、tc(テンセント)、gcpnative
      # Google Cloud Platformプロバイダーには"gcpnative"を使用できます。サービスアカウント認証情報を使用して認証します。
      address: localhost # MinIO/S3のアドレス
      port: 9000   # MinIO/S3のポート
      bucketName: "a-bucket" # MinIO/S3のMilvusバケット名、Milvusインスタンスと同じにします
      backupBucketName: "a-bucket" # バックアップデータを保存するバケット名。バックアップデータはbackupBucketName/backupRootPathに保存されます
      rootPath: "files" # MinIO/S3のMilvusストレージルートパス、milvusインスタンスと同じにします
      ...
    ```

    <Admonition type="info" icon="📘" title="注意">

    <ul>
    <li><p>Docker Composeを使用してインストールしたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>a-bucket</code>、<code>rootPath</code>のデフォルトは<code>files</code>です。</p></li>
    <li><p>KubernetesにインストールしたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>milvus-bucket</code>、<code>rootPath</code>のデフォルトは<code>file</code>です。</p></li>
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

1. バックアップファイルを確認します。

    - `minio.address`および`minio.port`をS3バケットに設定した場合、バックアップファイルはすでにS3バケットにあります。

    - `minio.address`および`minio.port`をMinioバケットに設定した場合、Minioコンソールまたは**mc**クライアントを使用してダウンロードできます。

        - [Minioコンソール](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html)からダウンロードするには、Minioコンソールにログインし、`minio.address`で指定されたバケットを見つけ、バケット内のファイルを選択して**ダウンロード**をクリックしてダウンロードします。

        - [the ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[ client](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)を好む場合は、以下のようにします：

            ```plaintext
            # Minioホストを構成
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # 利用可能なバケットを一覧表示
            mc ls my_minio
            
            # バケットからファイルをダウンロード
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. ダウンロードしたアーカイブを解凍し、**backup**フォルダのコンテンツのみをZilliz Cloudにアップロードします。

## Zilliz Cloudへのデータ移行\{#migrate-data-to-zilliz-cloud}

バックアップファイルが用意されたので、ローカルファイルから直接またはオブジェクトストレージからデータを移行できます。

<Supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - バックアップファイル経由でMilvusから移行デモ" />

<Admonition type="info" icon="📘" title="注意">

<p>全文検索が既にソースコレクションで有効になっている場合、移行後もZilliz Cloudはターゲットコレクションにその機能設定を保持します。これらの継承された設定は変更できません。</p>

</Admonition>

## 移行プロセスの監視\{#monitor-the-migration-process}

**移行**をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進行状況を確認できます。ジョブステータスが**進行中**から**成功**に変わると、移行が完了します。

<Supademo id="cme9my2nn4b64h3pyiyvsakqb" title="Zilliz Cloud - 移行プロセスを監視" />

<Admonition type="info" icon="📘" title="注意">

<p>移行後は、ターゲットクラスターのコレクション数とエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

## 移行後\{#post-migration}

移行ジョブが完了した後、以下の点に注意してください：

- **インデックス作成**：移行プロセスでは、移行されたコレクションに[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- **手動でのロードが必要**：自動インデックス作成にもかかわらず、移行されたコレクションは検索またはクエリ操作に対してすぐに使用可能にはなりません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロードとリリース](./load-release-collections)を参照してください。

## 移行ジョブをキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合、以下の手順に従ってトラブルシューティングおよび移行を再開できます：

1. [ジョブ](./job-center)ページで、失敗した移行ジョブを特定してキャンセルします。

1. **アクション**列の**詳細を表示**をクリックして、エラーログにアクセスします。

## よくある質問\{#faq}

1. **オブジェクトストレージバケットに保存されているバックアップファイルから移行する場合、どの形式のURLに従えばよいですか？**

    次の表は、異なるオブジェクトストレージサービスのURL例を示しています。バックアップファイルから移行する場合、バックアップフォルダのみ選択できることに注意してください。

    <table>
       <tr>
         <th colspan="2"><p><strong>クラウドオブジェクトストレージ</strong></p></th>
         <th><p><strong>URL形式</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><strong>Amazon S3</strong></p></td>
         <td><p>AWSオブジェクトURL、仮想ホスト形式</p></td>
         <td><p><i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>AWSオブジェクトURL、パス形式</p></td>
         <td><p><i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>Amazon S3 URI</p></td>
         <td><p>s3://\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Google Cloud Storage</strong></p></td>
         <td><p>GSCパプリックURL</p></td>
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

