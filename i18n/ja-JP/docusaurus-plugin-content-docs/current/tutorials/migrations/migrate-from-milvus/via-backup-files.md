---
title: "バックアップファイルを使用してMilvusからZilliz Cloudに移行する | Cloud"
slug: /via-backup-files
sidebar_label: "バックアップファイルへ"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、Milvusベクトルデータベースを使用したいユーザー向けに、Milvusを完全に管理されたクラウドホストソリューションとして提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。 | Cloud"
type: origin
token: Pg4pwmKpzibwjhkCwRCcj1QJnHd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - backup files
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';


# バックアップファイルを使用してMilvusからZilliz Cloudに移行する

Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、Milvusベクトルデータベースを使用したいユーザー向けに、Milvusを完全に管理されたクラウドホストソリューションとして提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。

このトピックでは、バックアップファイルを直接アップロードしてMilvusから移行する方法について説明します。データベースエンドポイントを介してデータを移行する方法については、「[エンドポイントへ](./via-endpoint)」を参照してください。

## 始める前に{#before-you-start}

次の前提条件が満たされていることを確認してください。

- 移行方法に基づいて、移行に必要な準備を行いました。

    - **ローカルファイルから**:事前にローカルバックアップファイルを準備してください。バックアップファイルの準備方法については、「[移行用バックアップファイルを準備](./via-backup-files#prepare-backup-files-for-migration)[する](./via-backup-files#prepare-backup-files-for-migration)」を参照してください。

    - **オブジェクトストレージから**: Milvusオブジェクトストレージの公開URLとアクセス資格情報。長期または一時的な資格情報を選択できます。

- 組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## 移行のためのバックアップファイルを準備する{#prepare-backup-files-for-migration}

Milvus 2. xの移行データを準備するには、

1. [milvus](https://github.com/zilliztech/milvus-backup/releases)[-backup](https://github.com/zilliztech/milvus-backup/releases)をダウンロードしてください。常に最新リリースを使用してください。

1. ダウンロードしたバイナリと**configs**フォルダを並べて作成し、**[backup. yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)**を**configs**フォルダにダウンロードします。

    ステップが完了すると、ワークスペースフォルダの構造は次のようになります:

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup. yaml**をカスタマイズする。

    通常の場合、このファイルをカスタマイズする必要はありません。しかし、先に進む前に、以下の設定項目が正しいかどうかを確認してください。

    - `アドレス`

    - `ダウンロードmivlus. port`

    - `minioのアドレス`

    - `minioのポート`

    - `minio. bucketName`

    - `minio. backupBucketName`

    - `ルートパス`

    <Admonition type="info" icon="Notes" title="undefined">

    <ul>
    <li><p>Docker Composeを使用してインストールされたMilvusインスタンスの場合、minio<code>.</code>bucketNameはデフォルトで<code>a-bucket</code>、<code>rootPath</code>はデフォルトで<code>ファイル</code>になります。</p></li>
    <li><p>KubernetesにインストールされたMilvusインスタンスの場合、minio<code>.</code>bucketNameのデフォルトは<code>milvus-bucket</code>で、<code>rootPath</code>のデフォルトは<code>file</code>です。</p></li>
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

    - S 3バケットにminio`. address`と`minio.port`を設定した場合、バックアップファイルはすでにS 3バケットにあります。

    - Minioバケットにminio`.`addressと`minio`. portを設定した場合、Minioコンソールまたは**mc**クライアントを使用してダウンロードできます。

        - Minio Consoleからダウンロードするには、[Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html)にログインし、minio. addressで指定されたBucketを探し、`Bucket`内のファイルを選択し、「**ダウンロード**」をクリックしてダウンロードします。

        - もし[、](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[クライアント](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)を使いたい場合は、以下のようにしてください:

            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. ダウンロードしたアーカイブを解凍し、**バックアップ**フォルダの内容のみをZilliz Cloudにアップロードします。

## Zilliz Cloudへのデータ移行{#migrate-data-to-zilliz-cloud}

バックアップファイルが準備できたら、ローカルファイルから直接またはオブジェクトストレージからデータを移行できます。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトに移動し、**移行**>**Milvus**>**バックアップファイル経由**を選択してください。

1. Milvus**からの移行**ページでは、

    - データがローカルファイルにある場合:

        - [**ローカルファイルから**]を選択し、データを含むフォルダをアップロードし、ターゲットクラスタを選択します。

    - データがオブジェクトストレージにある場合:

        - [**オブジェクトストレージから**]を選択し、サービス(S 3、Azure Blob、GCPなど)を選択し、データのオブジェクトURLまたはS 3 URIを入力し、必要な資格情報を入力して、ターゲットクラスターを選択します。

        - 適切な**資格情報タイプ**を指定して、必要な資格情報を提供します。

            - **長期**:頻繁な再認証なしでリソースに永続的にアクセスする場合は、このオプションを使用します。

            - **セッション**:限られた期間有効な一時的な資格情報の場合、特定のユーザーセッション中の短期間のアクセスに最適です。

1. [**移行**]をクリックします。

![migrate_from_milvus_via_backup_file](/img/ja-JP/migrate_from_milvus_via_backup_file.png)

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/ja-JP/verify_collection.png)

Zilliz Cloudは、最適化されたインデックス作成のために[AUTOINDEX](./autoindex-explained)のみをサポートしており、このアルゴリズムを使用して移行されたコレクションを自動的にインデックス化します。

コレクションがロードされたら、お好みの方法で自由に操作できます。

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

